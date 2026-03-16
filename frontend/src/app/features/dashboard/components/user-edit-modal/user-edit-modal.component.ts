import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { User, UserUpdate } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { Role } from 'src/app/core/models/role.enum';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-user-edit-modal',
  templateUrl: './user-edit-modal.component.html',
  styleUrls: ['./user-edit-modal.component.scss'],
  standalone: true, // Mark as standalone
  imports: [CommonModule, ReactiveFormsModule] // Add necessary imports for standalone components
})
export class UserEditModalComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<User>();

  userForm!: FormGroup;
  roles = Object.values(Role);

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.initForm();
  }

  ngOnInit(): void {
    // Form is initialized in constructor, but can be re-initialized here if needed
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.userForm.patchValue(this.user);
    }
    if (changes['isOpen'] && !this.isOpen) {
      this.userForm.reset(); // Reset form when modal closes
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      role: ['', Validators.required],
      bio: [''],
      telephone: [''],
      dateNaissance: [''],
      adresse: [''],
      ville: [''],
      codePostal: [''],
      pays: [''],
      photoUrl: [''],
      isActive: [false],
      isEmailVerified: [false]
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.userForm.valid && this.user) {
      const updatedUserData: UserUpdate = {
        nom: this.userForm.get('nom')?.value,
        prenom: this.userForm.get('prenom')?.value,
        bio: this.userForm.get('bio')?.value,
        telephone: this.userForm.get('telephone')?.value,
        dateNaissance: this.userForm.get('dateNaissance')?.value,
        adresse: this.userForm.get('adresse')?.value,
        ville: this.userForm.get('ville')?.value,
        codePostal: this.userForm.get('codePostal')?.value,
        pays: this.userForm.get('pays')?.value,
        photoUrl: this.userForm.get('photoUrl')?.value,
      };

      const fullUpdateData = {
        ...updatedUserData,
        role: this.userForm.get('role')?.value,
        isActive: this.userForm.get('isActive')?.value,
        isEmailVerified: this.userForm.get('isEmailVerified')?.value,
      };


      this.userService.updateUser(this.user.id, fullUpdateData).subscribe({
        next: (updatedUser) => {
          this.userUpdated.emit(updatedUser);
          this.onClose();
        },
        error: (err: any) => { // Explicitly type err
          console.error('Error updating user', err);
          // Handle error (e.g., show error message)
        }
      });
    }
  }
}
