import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UiCommonModule } from '@activepieces/ui/common';
import { CommonModule } from '@angular/common';
import {
  InvitationType,
  PlatformRole,
  ProjectMemberRole,
  isNil,
} from '@activepieces/shared';
import { LottieModule } from 'ngx-lottie';
import { MatDialogRef } from '@angular/material/dialog';
import { RolesDisplayNames } from 'ee-project-members';
import { UserInviationService } from '../../../../../../common/src/lib/service/user-invitations.service';

@Component({
  templateUrl: './invite-user-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, UiCommonModule, LottieModule],
})
export class InviteUserDialogComponent {
  readonly dialogTitle = $localize`Invite User`;
  loading$ = new BehaviorSubject(false);
  readonly platformRole = PlatformRole;
  readonly projectRole = ProjectMemberRole;
  readonly invitationType = InvitationType;

  formGroup: FormGroup<{
    email: FormControl<string>;
    type: FormControl<InvitationType>;
    platformRole: FormControl<PlatformRole>;
    projectRole: FormControl<ProjectMemberRole>;
  }>;
  invitationTypeSubject: BehaviorSubject<InvitationType> =
    new BehaviorSubject<InvitationType>(InvitationType.PROJECT);

  sendUser$: Observable<void>;

  readonly projectMemberRolesOptions = Object.values(ProjectMemberRole)
    .filter((f) => !isNil(RolesDisplayNames[f]))
    .map((role) => {
      return {
        value: role,
        name: RolesDisplayNames[role],
      };
    });

  constructor(
    private fb: FormBuilder,
    private userInvitationService: UserInviationService,
    private dialogRef: MatDialogRef<InviteUserDialogComponent>
  ) {
    this.formGroup = this.fb.group({
      email: this.fb.control<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      type: this.fb.control<InvitationType>(this.invitationTypeSubject.value, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      platformRole: this.fb.control<PlatformRole>(PlatformRole.ADMIN, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      projectRole: this.fb.control<ProjectMemberRole>(ProjectMemberRole.ADMIN, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  listenForInvitationTypeChange(type: InvitationType) {
    this.invitationTypeSubject.next(type);
  }

  submit() {
    this.formGroup.markAllAsTouched();
    if (!this.loading$.value && this.formGroup.valid) {
      this.loading$.next(true);
      const { email, type, platformRole, projectRole } = this.formGroup.value;
      this.sendUser$ = this.userInvitationService
        .inviteUser({
          email: email!,
          type: type!,
          platformRole: platformRole!,
          projectRole:
            type === InvitationType.PLATFORM ? undefined : projectRole!,
        })
        .pipe(
          tap(() => {
            this.loading$.next(false);
            this.dialogRef.close();
          })
        );
    }
  }

  close() {
    this.dialogRef.close();
  }
}
