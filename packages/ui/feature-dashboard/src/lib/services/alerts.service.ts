import {
  Alert,
  CreateAlertParams,
  ListAlertsParams,
} from '@activepieces/ee-shared';
import { ApId, SeekPage } from '@activepieces/shared';
import { environment } from '@activepieces/ui/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  constructor(private http: HttpClient) {}
  list(req: ListAlertsParams) {
    const params: Params = {
      projectId: req.projectId,
      cursor: req.cursor,
      limit: req.limit,
    };
    return this.http.get<SeekPage<Alert>>(environment.apiUrl + '/alerts', {
      params,
    });
  }
  add(req: CreateAlertParams) {
    const body: CreateAlertParams = {
      projectId: req.projectId,
      channel: req.channel,
      details: req.details,
    };
    return this.http.post<void>(environment.apiUrl + '/alerts', body);
  }
  remove(req: { id: ApId }) {
    return this.http.delete<void>(environment.apiUrl + `/alerts/${req.id}`);
  }
}