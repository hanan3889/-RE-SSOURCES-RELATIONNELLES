import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { FavorisService, ProgressionStats, Ressource } from 'src/app/core/services/favoris.service';
import { CommentaireService, MesCommentaire } from 'src/app/features/resources/services/commentaire.service';
import { UserService } from 'src/app/core/services/user.service';
import { MessageItem, MessageService } from 'src/app/core/services/message.service';

interface ProfilePublication {
  id: number;
  title: string;
  status: 'published' | 'pending' | 'private';
  createdDate: Date;
  views: number;
  comments: number;
}

interface ProfileFavorite {
  id: number;
  title: string;
  category: string;
}

interface ProfileComment {
  id: number;
  resourceId: number;
  resourceTitle: string;
  date: Date;
  content: string;
  rating: number;
}

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
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  activeTab = 'identity';
  isEditingInfo = false;
  isChangingPassword = false;
  loading = false;
  currentUserId: number | null = null;

  infoForm!: FormGroup;
  passwordForm!: FormGroup;

  user = {
    firstName: '',
    lastName: '',
    email: '',
    avatar: '',
    role: '',
    registrationDate: new Date()
  };

  publications: ProfilePublication[] = [];
  ongoingActivities: any[] = [];
  comments: ProfileComment[] = [];
  invitations: InboxInvitation[] = [];
  directMessages: MessageItem[] = [];
  conversations: DirectConversation[] = [];
  selectedConversationParticipantId: number | null = null;
  selectedConversationName = '';
  conversationDraft = '';
  messageTarget = '';
  messageDraft = '';
  messageFeedback = '';
  favoriteResources: ProfileFavorite[] = [];
  stats = { resourcesViewed: 0, resourcesUsed: 0, resourcesPublished: 0, favoriteCount: 0, savedForLater: 0 };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private favorisService: FavorisService,
    private commentaireService: CommentaireService,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.idUtilisateur;
      this.user.firstName = currentUser.prenom;
      this.user.lastName = currentUser.nom;
      this.user.email = currentUser.email;
      this.user.role = currentUser.role;

      this.loadRealProfileData(currentUser.idUtilisateur);
    }
    this.initForms();
  }

  private loadRealProfileData(userId: number): void {
    this.loading = true;

    forkJoin({
      profile: this.userService.getUserById(userId),
      progression: this.favorisService.getProgression(),
      favoris: this.favorisService.getMesFavoris(),
      ressources: this.favorisService.getMesRessources(),
      commentaires: this.commentaireService.getMine(),
      inbox: this.messageService.getInbox(),
      mine: this.messageService.getMine()
    }).subscribe({
      next: ({ profile, progression, favoris, ressources, commentaires, inbox, mine }) => {
        this.bindIdentity(profile);
        this.bindProgression(progression, commentaires);
        this.bindFavoris(favoris);
        this.bindPublications(ressources, commentaires);
        this.bindCommentaires(commentaires);
        this.bindInbox(inbox);
        this.bindConversations(mine);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private bindIdentity(profile: any): void {
    this.user.firstName = profile?.prenom ?? this.user.firstName;
    this.user.lastName = profile?.nom ?? this.user.lastName;
    this.user.email = profile?.email ?? this.user.email;
    this.user.role = profile?.nomRole ?? this.user.role;
    if (profile?.createdAt) {
      this.user.registrationDate = new Date(profile.createdAt);
    }

    if (this.infoForm) {
      this.infoForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email
      });
    }
  }

  private bindProgression(progression: ProgressionStats, commentaires: MesCommentaire[]): void {
    const viewedDistinct = new Set(commentaires.map(c => c.idRessource)).size;
    this.stats = {
      resourcesViewed: viewedDistinct,
      resourcesUsed: progression.nbExploitees,
      resourcesPublished: progression.nbPubliees,
      favoriteCount: progression.nbFavoris,
      savedForLater: progression.nbSauvegardees
    };
  }

  private bindFavoris(favoris: Ressource[]): void {
    this.favoriteResources = favoris.map(f => ({
      id: f.idRessource,
      title: f.titre,
      category: f.nomCategorie
    }));
  }

  private bindPublications(ressources: Ressource[], commentaires: MesCommentaire[]): void {
    const commentsByResource = new Map<number, number>();
    for (const comment of commentaires) {
      commentsByResource.set(comment.idRessource, (commentsByResource.get(comment.idRessource) ?? 0) + 1);
    }

    this.publications = ressources.map(r => ({
      id: r.idRessource,
      title: r.titre,
      status: this.mapPublicationStatus(r.statut),
      createdDate: new Date(r.dateCreation),
      views: 0,
      comments: commentsByResource.get(r.idRessource) ?? 0
    }));
  }

  private bindCommentaires(commentaires: MesCommentaire[]): void {
    this.comments = commentaires.map(c => ({
      id: c.idCommentaire,
      resourceId: c.idRessource,
      resourceTitle: c.titreRessource,
      date: new Date(c.dateCreation),
      content: c.contenu,
      rating: 5
    }));
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

  private mapPublicationStatus(statut: string): 'published' | 'pending' | 'private' {
    const normalized = (statut ?? '').toLowerCase();
    if (normalized === 'publiee') return 'published';
    if (normalized === 'envalidation') return 'pending';
    return 'private';
  }

  initForms() {
    this.infoForm = this.fb.group({
      firstName: [this.user.firstName, Validators.required],
      lastName: [this.user.lastName, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email]],
      currentPasswordConfirm: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmNewPassword')?.value
      ? null : { mismatch: true };
  }

  // --- FONCTIONS DE NAVIGATION ---
  selectTab(tab: string) { this.activeTab = tab; }
  formatDate(date: Date) { return new Date(date).toLocaleDateString(); }
  toggleEditInfo() { this.isEditingInfo = !this.isEditingInfo; }
  toggleChangePassword() { this.isChangingPassword = !this.isChangingPassword; }

  // --- ACTIONS DE COMPTE ---
  onSaveInfo() {
    if (this.infoForm.valid) {
      alert('Informations mises à jour avec succès !');
      this.isEditingInfo = false;
    }
  }

  onUpdatePassword() {
    if (this.passwordForm.valid) {
      alert('Mot de passe modifié !');
      this.isChangingPassword = false;
      this.passwordForm.reset();
    }
  }

  downloadData() { alert('Préparation de l\'export de vos données...'); }
  deleteAccount() { 
    if(confirm('Êtes-vous sûr de vouloir supprimer votre compte ?')) {
      alert('Compte supprimé.');
    }
  }

  // --- GESTION DES PUBLICATIONS & CONTENU ---
  createNewResource() { this.router.navigate(['/ressources/creer']); }
  
  getStatusBadge(status: string): string {
    const badges: any = {
      'published': 'Publié',
      'pending': 'En attente',
      'private': 'Privé'
    };
    return badges[status] || status;
  }

  // --- INTERACTIONS SOCIALES ---
  resumeActivity(id: any) { alert('Reprise de l\'activité...'); }
  editComment(id: any) { alert('Modification du commentaire...'); }
  deleteComment(id: any) {
    this.commentaireService.delete(id).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== id);
        this.stats.resourcesViewed = new Set(this.comments.map(c => c.resourceId)).size;
      },
      error: () => {}
    });
  }
  respondToInvitation(invitation: InboxInvitation, accept: boolean) {
    this.messageService.setInvitationStatus(invitation.id, accept).subscribe({
      next: (updated) => {
        this.invitations = this.invitations.filter(i => i.id !== invitation.id);
        if (accept) {
          const resourceId = updated?.idRessource ?? invitation.resourceId;
          if (resourceId) {
            this.router.navigate(['/ressources', resourceId]);
          } else {
            alert('Impossible d\'ouvrir la ressource: identifiant de ressource manquant sur cette invitation.');
          }
        }
      },
      error: () => {}
    });
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

  removeFavorite(resourceId: number): void {
    this.favorisService.retirerFavori(resourceId).subscribe({
      next: () => {
        this.favoriteResources = this.favoriteResources.filter(r => r.id !== resourceId);
        this.stats.favoriteCount = Math.max(0, this.stats.favoriteCount - 1);
      },
      error: () => {}
    });
  }

  editPublication(id: number): void {
    this.router.navigate(['/ressources', id, 'editer']);
  }

  deletePublication(id: number): void {
    alert('Suppression publication à brancher côté API si besoin.');
  }
}