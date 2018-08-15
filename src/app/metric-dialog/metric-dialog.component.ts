import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';

export interface DialogData {
  metrics:any[] 
}

@Component({
  selector: 'app-metric-dialog',
  templateUrl: './metric-dialog.component.html',
  styleUrls: ['./metric-dialog.component.scss']
})
export class MetricDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<MetricDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

    onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  	console.log(this.data.metrics)
  }

  boolValue(x){
    if(x==0){
      return 'false'
    }
    else return 'true'
  }

}
