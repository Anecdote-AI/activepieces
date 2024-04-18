import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { EmbeddingService, UiCommonModule } from '@activepieces/ui/common';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-connection-name-control',
  standalone: true,
  imports: [UiCommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if( !hideConnectionName ){
    <mat-form-field class="ap-w-full" appearance="outline">
      <mat-label i18n>Name</mat-label>
      <input
        [matTooltip]="keyTooltip"
        cdkFocusInitial
        [formControl]="control"
        matInput
        type="text"
      />
      <mat-error *ngIf="control.invalid">
        @if( control.getError('required')) {
        <ng-container i18n>Name is required</ng-container>
        } @else if(control.getError('pattern')) {
        <ng-container i18n>
          Name can only contain letters, numbers and underscores
        </ng-container>

        } @else if(control.getError('nameUsed')) {
        <ng-container i18n> Name is already used </ng-container>
        }
      </mat-error>
    </mat-form-field>
    }
  `,
})
export class ConnectionNameControlComponent implements OnInit {
  @Input({ required: true }) control!: FormControl;
  hideConnectionName = false;
  constructor(private embeddingService: EmbeddingService) {}
  ngOnInit(): void {
    this.hideConnectionName =
      this.embeddingService.getPredefinedConnectionName() !== undefined;
    if (this.hideConnectionName) {
      this.control.setValue(this.embeddingService.getPredefinedConnectionName());
    }
  }
  readonly keyTooltip = $localize`The ID of this connection definition. You will need to select this key whenever you want to reuse this connection`;
}