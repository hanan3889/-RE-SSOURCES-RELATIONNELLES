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
import { FavorisService } from 'src/app/core/services/favoris.service';

interface ActivityQuestion {
  prompt: string;
  options: string[];
}

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
  isExploitee = false;
  isSavedForLater = false;
  isStarted = false;
  quizError = '';
  currentQuestionIndex = 0;
  selectedOptionIndex: number | null = null;
  userAnswers: number[] = [];
  quizCompleted = false;
  readonly activityQuestions: ActivityQuestion[] = [
    {
      prompt: 'Quand vous avez une heure libre, que préférez-vous faire ?',
      options: ['Lire ou regarder un contenu inspirant', 'Ranger la maison', 'Répondre à mes emails']
    },
    {
      prompt: 'Quelle activité vous motive le plus à partager avec d\'autres ?',
      options: ['Un atelier créatif ou collaboratif', 'Une réunion administrative', 'Une tâche répétitive']
    },
    {
      prompt: 'Pour mieux vous connaître, quel choix vous ressemble le plus ?',
      options: ['Découvrir de nouvelles idées', 'Toujours faire la même chose', 'Éviter toute interaction']
    }
  ];
  currentRessourceId: number | null = null;
  replyBoxOpenFor: number | null = null;
  replyDrafts: Record<number, string> = {};
  commentForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private ressourceService: RessourceService,
    private commentaireService: CommentaireService,
    private favorisService: FavorisService,
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
          this.loadExploitationStatus(id);
          this.loadSauvegardeStatus(id);
        }
        return this.ressourceService.getRessourceById(id);
      }),
      tap((ressource) => {
        if (!ressource) {
          this.comments = [];
          this.isStarted = false;
        } else if (this.isDemarrable(ressource)) {
          this.loadDemarrageStatus(ressource.id);
        } else {
          this.isStarted = false;
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

  private loadExploitationStatus(ressourceId: number): void {
    if (!this.isLoggedIn) {
      this.isExploitee = false;
      return;
    }

    this.favorisService.getExploitationStatus(ressourceId).subscribe({
      next: (status) => {
        this.isExploitee = status.exploitee;
      },
      error: () => {
        this.isExploitee = false;
      }
    });
  }

  private loadSauvegardeStatus(ressourceId: number): void {
    if (!this.isLoggedIn) {
      this.isSavedForLater = false;
      return;
    }

    this.favorisService.getSauvegardeStatus(ressourceId).subscribe({
      next: (status) => {
        this.isSavedForLater = status.sauvegardee;
      },
      error: () => {
        this.isSavedForLater = false;
      }
    });
  }

  private loadDemarrageStatus(ressourceId: number): void {
    if (!this.isLoggedIn) {
      this.isStarted = false;
      return;
    }

    this.favorisService.getDemarrageStatus(ressourceId).subscribe({
      next: (status) => {
        this.isStarted = status.demarree;
        if (this.isStarted) {
          this.startQuiz();
        } else {
          this.resetQuiz();
        }
      },
      error: () => {
        this.isStarted = false;
        this.resetQuiz();
      }
    });
  }

  get currentQuestion(): ActivityQuestion | null {
    return this.activityQuestions[this.currentQuestionIndex] ?? null;
  }

  get totalQuestions(): number {
    return this.activityQuestions.length;
  }

  startQuiz(): void {
    this.quizError = '';
    this.currentQuestionIndex = 0;
    this.selectedOptionIndex = null;
    this.userAnswers = [];
    this.quizCompleted = false;
  }

  resetQuiz(): void {
    this.quizError = '';
    this.currentQuestionIndex = 0;
    this.selectedOptionIndex = null;
    this.userAnswers = [];
    this.quizCompleted = false;
  }

  selectOption(optionIndex: number): void {
    this.selectedOptionIndex = optionIndex;
    this.quizError = '';
  }

  validateAnswer(): void {
    if (this.selectedOptionIndex === null) {
      this.quizError = 'Veuillez sélectionner une option avant de valider.';
      return;
    }

    this.userAnswers[this.currentQuestionIndex] = this.selectedOptionIndex;
    this.selectedOptionIndex = null;
    this.quizError = '';

    const isLastQuestion = this.currentQuestionIndex >= this.totalQuestions - 1;
    if (isLastQuestion) {
      this.quizCompleted = true;
      return;
    }

    this.currentQuestionIndex += 1;
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

  toggleExploitation(ressourceId: number): void {
    if (!this.isLoggedIn) {
      alert('Veuillez vous connecter pour modifier le statut de progression.');
      this.router.navigate(['/auth/login']);
      return;
    }

    const nextValue = !this.isExploitee;
    this.favorisService.setExploitationStatus(ressourceId, nextValue).subscribe({
      next: () => {
        this.isExploitee = nextValue;
      },
      error: (err) => {
        const message = err?.error?.message || 'Impossible de mettre à jour le statut de progression.';
        alert(message);
      }
    });
  }

  toggleSauvegarde(ressourceId: number): void {
    if (!this.isLoggedIn) {
      alert('Veuillez vous connecter pour mettre une ressource de côté.');
      this.router.navigate(['/auth/login']);
      return;
    }

    const nextValue = !this.isSavedForLater;
    this.favorisService.setSauvegardeStatus(ressourceId, nextValue).subscribe({
      next: () => {
        this.isSavedForLater = nextValue;
      },
      error: (err) => {
        const message = err?.error?.message || 'Impossible de mettre a jour la sauvegarde de cette ressource.';
        alert(message);
      }
    });
  }

  isDemarrable(ressource: Ressource): boolean {
    const normalized = (ressource.format ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    return normalized === 'activite' || normalized === 'jeu';
  }

  toggleDemarrage(ressourceId: number): void {
    if (!this.isLoggedIn) {
      alert('Veuillez vous connecter pour démarrer cette activité.');
      this.router.navigate(['/auth/login']);
      return;
    }

    const nextValue = !this.isStarted;
    this.favorisService.setDemarrageStatus(ressourceId, nextValue).subscribe({
      next: () => {
        this.isStarted = nextValue;
        if (nextValue) {
          this.startQuiz();
        } else {
          this.resetQuiz();
        }
      },
      error: (err) => {
        const message = err?.error?.message || 'Impossible de mettre à jour le démarrage de cette activité.';
        alert(message);
      }
    });
  }
}
