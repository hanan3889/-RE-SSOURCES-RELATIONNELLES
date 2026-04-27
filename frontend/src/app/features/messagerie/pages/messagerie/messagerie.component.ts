import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageItem, MessageService } from 'src/app/core/services/message.service';

interface InboxInvitation {
  id: number;
  resourceId: number | null;
  title: string;
  organizer: string;
  date: Date;
}

interface DirectConversation {
  participantId: number;
  participantName: string;
  lastMessage: string;
  lastDate: Date;
}

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './messagerie.component.html',
  styleUrl: './messagerie.component.scss'
})
export class MessagerieComponent implements OnInit {
  loading = false;
  currentUserId: number | null = null;

  invitations: InboxInvitation[] = [];
  directMessages: MessageItem[] = [];
  conversations: DirectConversation[] = [];

  selectedConversationParticipantId: number | null = null;
  selectedConversationName = '';
  conversationDraft = '';

  messageTarget = '';
  messageDraft = '';
  messageFeedback = '';

  constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.idUtilisateur ?? null;
    this.loadMessagingData();
  }

  private loadMessagingData(): void {
    this.loading = true;

    forkJoin({
      inbox: this.messageService.getInbox(),
      mine: this.messageService.getMine()
    }).subscribe({
      next: ({ inbox, mine }) => {
        this.bindInbox(inbox);
        this.bindConversations(mine);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private bindInbox(items: MessageItem[]): void {
    this.invitations = items
      .filter(i => i.typeMessage === 'invitation' && i.statutInvitation === 'pending')
      .map(i => ({
        id: i.idMessage,
        resourceId: i.idRessource ?? null,
        title: i.titreRessource ? `Invitation: ${i.titreRessource}` : 'Invitation a une ressource',
        organizer: `${i.prenomAuteur} ${i.nomAuteur}`.trim(),
        date: new Date(i.dateCreation)
      }));
  }

  private bindConversations(items: MessageItem[]): void {
    this.directMessages = items.filter(i => i.typeMessage === 'direct');

    const byParticipant = new Map<number, { name: string; messages: MessageItem[]; lastDate: Date }>();

    for (const msg of this.directMessages) {
      const target = this.resolveConversationTarget(msg);
      if (!target) {
        continue;
      }

      const existing = byParticipant.get(target.participantId);
      const msgDate = new Date(msg.dateCreation);

      if (!existing) {
        byParticipant.set(target.participantId, {
          name: target.participantName,
          messages: [msg],
          lastDate: msgDate
        });
        continue;
      }

      existing.messages.push(msg);
      if (msgDate > existing.lastDate) {
        existing.lastDate = msgDate;
      }
    }

    this.conversations = Array.from(byParticipant.entries())
      .map(([participantId, data]) => {
        const sorted = [...data.messages].sort((a, b) =>
          new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());

        return {
          participantId,
          participantName: data.name,
          lastMessage: sorted[0]?.contenu ?? '',
          lastDate: data.lastDate
        };
      })
      .sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());

    if (!this.conversations.length) {
      this.selectedConversationParticipantId = null;
      this.selectedConversationName = '';
      return;
    }

    const selectedStillExists = this.conversations.some(c => c.participantId === this.selectedConversationParticipantId);
    if (!selectedStillExists) {
      this.selectConversation(this.conversations[0].participantId);
    }
  }

  private resolveConversationTarget(msg: MessageItem): { participantId: number; participantName: string } | null {
    if (!this.currentUserId) {
      return null;
    }

    const isSentByMe = msg.idAuteur === this.currentUserId;
    if (isSentByMe) {
      if (!msg.idDestinataire) {
        return null;
      }

      return {
        participantId: msg.idDestinataire,
        participantName: `${msg.prenomDestinataire ?? ''} ${msg.nomDestinataire ?? ''}`.trim()
      };
    }

    return {
      participantId: msg.idAuteur,
      participantName: `${msg.prenomAuteur ?? ''} ${msg.nomAuteur ?? ''}`.trim()
    };
  }

  selectConversation(participantId: number): void {
    this.selectedConversationParticipantId = participantId;
    const selected = this.conversations.find(c => c.participantId === participantId);
    this.selectedConversationName = selected?.participantName ?? '';
    this.messageFeedback = '';
  }

  get selectedConversationMessages(): MessageItem[] {
    if (!this.selectedConversationParticipantId) {
      return [];
    }

    return this.directMessages
      .filter((msg) => this.resolveConversationTarget(msg)?.participantId === this.selectedConversationParticipantId)
      .sort((a, b) => new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime());
  }

  isSentByMe(msg: MessageItem): boolean {
    return !!this.currentUserId && msg.idAuteur === this.currentUserId;
  }

  respondToInvitation(invitation: InboxInvitation, accept: boolean): void {
    this.messageService.setInvitationStatus(invitation.id, accept).subscribe({
      next: (updated) => {
        this.invitations = this.invitations.filter(i => i.id !== invitation.id);
        if (accept) {
          const resourceId = updated?.idRessource ?? invitation.resourceId;
          if (resourceId) {
            this.router.navigate(['/ressources', resourceId]);
          } else {
            this.messageFeedback = 'Impossible d\'ouvrir la ressource: identifiant manquant sur cette invitation.';
          }
        }
      },
      error: () => {}
    });
  }

  sendDirectMessage(): void {
    const cible = this.messageTarget.trim();
    const contenu = this.messageDraft.trim();

    if (!cible || !contenu) {
      this.messageFeedback = 'Renseignez un destinataire (prenom nom) et un message.';
      return;
    }

    this.messageService.sendDirectMessage(cible, contenu).subscribe({
      next: (created) => {
        this.messageFeedback = 'Message envoye.';
        this.messageTarget = '';
        this.messageDraft = '';
        this.directMessages = [...this.directMessages, created];
        this.bindConversations(this.directMessages);

        const target = this.resolveConversationTarget(created);
        if (target) {
          this.selectConversation(target.participantId);
        }
      },
      error: (err) => {
        this.messageFeedback = err?.error?.message || 'Envoi impossible.';
      }
    });
  }

  sendConversationReply(): void {
    const contenu = this.conversationDraft.trim();
    const cible = this.selectedConversationName.trim();

    if (!cible || !contenu) {
      return;
    }

    this.messageService.sendDirectMessage(cible, contenu).subscribe({
      next: (created) => {
        this.conversationDraft = '';
        this.messageFeedback = '';
        this.directMessages = [...this.directMessages, created];
        this.bindConversations(this.directMessages);

        const target = this.resolveConversationTarget(created);
        if (target) {
          this.selectConversation(target.participantId);
        }
      },
      error: (err) => {
        this.messageFeedback = err?.error?.message || 'Envoi impossible.';
      }
    });
  }
}
