import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/user.model';
import { UserEditModalComponent } from '../../components/user-edit-modal/user-edit-modal.component'; // Import the new modal component
import { CommonModule } from '@angular/common'; // Needed for ngIf, ngFor
import { ReactiveFormsModule } from '@angular/forms'; // Needed for the modal's form
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true, // Assuming DashboardComponent is standalone
  imports: [CommonModule, UserEditModalComponent, ReactiveFormsModule] // Add UserEditModalComponent to imports
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  isEditModalOpen: boolean = false; // Control modal visibility

  constructor(private userService: UserService, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err: any) => {
        console.error('Error loading users', err);
        // Handle error (e.g., show a message to the user)
      }
    });
  }

  onEditUser(user: User): void {
    this.selectedUser = user;
    this.isEditModalOpen = true; // Open the modal
  }

  onCloseEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedUser = null; // Clear selected user when modal closes
  }

  onUserUpdated(updatedUser: User): void {
    // Find the updated user in the list and replace it
    const index = this.users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = updatedUser;
    }
    this.onCloseEditModal(); // Close modal after update
    this.loadUsers(); // Refresh the user list to ensure data consistency
  }

  onResetPassword(user: User): void {
    if (confirm(`Are you sure you want to reset the password for ${user.email}?`)) {
      // For now, we'll use a dummy password. In a real app, you'd have a secure way to set/generate it.
      const newDummyPassword = 'NewSecurePassword123!'; // This should be handled securely by the backend
      this.userService.resetUserPassword(user.id, newDummyPassword).subscribe({
        next: () => {
          alert(`Password for ${user.email} has been reset.`);
        },
        error: (err: any) => { // Explicitly type err
          console.error('Error resetting password', err);
          alert('Failed to reset password.');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  onDeleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete the user ${user.email}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          alert(`User ${user.email} deleted successfully.`);
          this.loadUsers(); // Refresh the user list
        },
        error: (err: any) => { // Explicitly type err
          console.error('Error deleting user', err);
          alert('Failed to delete user.');
        }
      });
    }
  }
}

