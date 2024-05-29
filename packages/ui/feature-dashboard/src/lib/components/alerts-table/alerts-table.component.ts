import { Platform, ProjectId, ProjectMemberRole } from '@activepieces/shared';
import {
  ApPaginatorComponent,
  AuthenticationService,
  GenericSnackbarTemplateComponent,
  PLATFORM_RESOLVER_KEY,
  UiCommonModule,
} from '@activepieces/ui/common';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, startWith, tap } from 'rxjs';
import { AlertsDataSource } from './alerts-table.datasource';
import { AlertsService } from '../../services/alerts.service';
import { MatDialog } from '@angular/material/dialog';
import { NewAlertDialogComponent } from '../dialogs/new-alert-dialog/new-alert-dialog.component';
import { Alert } from '@activepieces/ee-shared';
import { ProjectMemberService } from '@ee/ui/project-members/src';

@Component({
  selector: 'app-alerts-table',
  templateUrl: './alerts-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [UiCommonModule, AsyncPipe],
})
export class AlertsTableComponent implements OnInit {
  @ViewChild(ApPaginatorComponent, { static: true })
  paginator: ApPaginatorComponent;
  upgradeNoteTitle = $localize`Unlock Alerts`;
  upgradeNote = $localize`Stay up to date with your flows, quota limits and updates with Alerts`;
  displayedColumns: string[] = ['channel', 'details', 'action'];
  showUpgrade = true;
  dataSource: AlertsDataSource;
  currentProject$: ProjectId;
  refresh$ = new BehaviorSubject<boolean>(true);
  addAlertDialogClosed$: Observable<void>;
  isAdmin$: Observable<boolean>
  constructor(
    private dialogService: MatDialog,
    private alertsService: AlertsService,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private snackBar: MatSnackBar,
    private projectMemberService: ProjectMemberService
  ) {
    this.showUpgrade = !(
      this.route.snapshot.data[PLATFORM_RESOLVER_KEY] as Platform
    ).alertsEnabled;
  }

  ngOnInit(): void {
    this.currentProject$ = this.authService.getProjectId();
    this.isAdmin$ = this.projectMemberService.isRole(ProjectMemberRole.ADMIN);
    this.dataSource = new AlertsDataSource(
      this.route.queryParams,
      this.paginator,
      this.alertsService,
      this.authService.getProjectId(),
      this.refresh$.asObservable().pipe(startWith(false))
    );
  }

  addAlert(): void {
    this.addAlertDialogClosed$ = this.dialogService.open(NewAlertDialogComponent, {
      restoreFocus: false,
    })
    .afterClosed()
    .pipe(
      tap(() => {
        this.snackBar.openFromComponent(GenericSnackbarTemplateComponent, {
          data: 'New alert has been added',
        });
        this.refresh$.next(true);
      })
    );
  }

  deleteAlert(alert: Alert): void {
    this.alertsService.remove({ id: alert.id }).pipe(
      tap(() => {
        this.snackBar.openFromComponent(GenericSnackbarTemplateComponent, {
          data: `Alert ${alert.details} deleted`,
        });
        this.refresh$.next(true);
      })
    );
  }
}