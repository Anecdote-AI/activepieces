import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SendUserInvitationRequest } from '@activepieces/shared';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserInviationService {
  constructor(private http: HttpClient) {}

  inviteUser(request: SendUserInvitationRequest) {
    return this.http.post<void>(
      `${environment.apiUrl}/user-invitations`,
      request
    );
  }

  accept({ invitationToken }: { invitationToken: string }) {
    return this.http.post<{ registered: boolean }>(
      `${environment.apiUrl}/user-invitations/accept`,
      { invitationToken }
    );
  }
}
