import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Ressource, RessourceService } from '../../services/ressource.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { SafeHtmlPipe } from '../../../../core/pipes/safe-html.pipe';
import { AuthService } from 'src/app/core/services/auth.service';
import { Commentaire, CommentaireService } from '../../services/commentaire.service';

@Component({
  selector: 'app-ressource-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe, ReactiveFormsModule, FormsModule],
  templateUrl: './ressource-detail.component.html',
  styleUrls: ['./ressource-detail.component.scss']
})
export class RessourceDetailComponent implements OnInit {
  ressource$!: Observable<Ressource | undefined>;
  isLoggedIn = false;
  comments: Commentaire[] = [];
  commentsLoading = false;
  isSubmittingComment = false;
  isSubmittingReply = false;
  currentRessourceId: number | null = null;
  replyBoxOpenFor: number | null = null;
  replyDrafts: Record<number, string> = {};
  commentForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private ressourceService: RessourceService,
    private commentaireService: CommentaireService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.commentForm = this.fb.group({
      contenu: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.ressource$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        this.currentRessourceId = Number.isNaN(id) ? null : id;
        if (!Number.isNaN(id)) {
          this.loadComments(id);
        }
        return this.ressourceService.getRessourceById(id);
      }),
      tap((ressource) => {
        if (!ressource) {
          this.comments = [];
        }
      })
    );
  }

  private loadComments(ressourceId: number): void {
    this.commentsLoading = true;
    this.commentaireService.getByRessource(ressourceId).subscribe({
      next: (items) => {
        this.comments = items;
        this.commentsLoading = false;
      },
      error: () => {
        this.comments = [];
        this.commentsLoading = false;
      }
    });
  }

  submitComment(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.currentRessourceId || this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const contenu = (this.commentForm.value.contenu ?? '').trim();
    if (!contenu) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.isSubmittingComment = true;
    this.commentaireService.create(this.currentRessourceId, contenu).subscribe({
      next: (created) => {
        this.comments = [created, ...this.comments];
        this.commentForm.reset();
        this.isSubmittingComment = false;
      },
      error: (err) => {
        this.isSubmittingComment = false;
        const message = err?.error?.message || 'Impossible d\'ajouter le commentaire.';
        alert(message);
      }
    });
  }

  canDeleteComment(comment: Commentaire): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return false;
    }

    const role = currentUser.role;
    const isModerator = role === 'moderateur' || role === 'administrateur' || role === 'super_administrateur';
    return isModerator || currentUser.idUtilisateur === comment.idUtilisateur;
  }

  deleteComment(commentaireId: number): void {
    this.commentaireService.delete(commentaireId).subscribe({
      next: () => {
        this.comments = this.comments.filter((item) => item.idCommentaire !== commentaireId);
      },
      error: (err) => {
        const message = err?.error?.message || 'Impossible de supprimer le commentaire.';
        alert(message);
      }
    });
  }

  get topLevelComments(): Commentaire[] {
    return this.comments
      .filter((comment) => !comment.idCommentaireParent)
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  }

  getRepliesFor(commentId: number): Commentaire[] {
    return this.comments
      .filter((comment) => comment.idCommentaireParent === commentId)
      .sort((a, b) => new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime());
  }

  toggleReplyBox(commentId: number): void {
    this.replyBoxOpenFor = this.replyBoxOpenFor === commentId ? null : commentId;
  }

  submitReply(parentCommentId: number): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const draft = (this.replyDrafts[parentCommentId] ?? '').trim();
    if (!draft) {
      return;
    }

    this.isSubmittingReply = true;
    this.commentaireService.createReply(parentCommentId, draft).subscribe({
      next: (created) => {
        this.comments = [...this.comments, created];
        this.replyDrafts[parentCommentId] = '';
        this.replyBoxOpenFor = null;
        this.isSubmittingReply = false;
      },
      error: (err) => {
        this.isSubmittingReply = false;
        const message = err?.error?.message || 'Impossible d\'envoyer la réponse.';
        alert(message);
      }
    });
  }

  addToFavorites(ressourceId: number): void {
    if (!this.isLoggedIn) {
      alert('Veuillez vous connecter pour ajouter une ressource à vos favoris.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.ressourceService.addFavori(ressourceId).subscribe({
      next: () => alert('Ressource ajoutée à vos favoris.'),
      error: (err) => {
        const message = err?.error?.message || 'Impossible d\'ajouter ce favori.';
        alert(message);
      }
    });
  }
}
