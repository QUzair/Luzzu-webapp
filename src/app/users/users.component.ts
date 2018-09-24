import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router'

// export class State {
//   constructor(public 'Dataset-PLD': string, public graphUri: string, public rankedValue: number) {
//    }
// }

interface State {
  'Dataset-PLD': string,
  'Graph-URI': string,
  'Rank-Value': number
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

export class UsersComponent implements OnInit {

  showSpinner = true
  users$: State[]
  states: State[]
  label = 'Label';
  stateCtrl: FormControl;
  filteredDatasets: Observable<any[]>;


  constructor(private data: DataService, private router: Router) {

    //Function for autocomplete search bar
    this.stateCtrl = new FormControl();
    this.filteredDatasets = this.stateCtrl.valueChanges
      .pipe(
        startWith(''),
        map(res => res ? this.filterDatasets(res) : this.users$.slice())
      );
  }

  ngOnInit() {

    this.data.currentRankedUsers.subscribe((res) => {
      console.log(res)
      this.users$ = res
      this.states = res
    })
    this.data.CurrentSpinner.subscribe(res => this.showSpinner = res)
  }

  //Send Selected Dataset Label to Service so we can keep state of current Dataset Profile
  setLabel(label) {
    this.data.changeLabel(label)
  }

  filterDatasets(name: string) {
    return this.users$.filter(res =>
      res['Dataset-PLD'].toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  //After selecting dataset to view in detail, we parse the dataset to URI format, 
  //Allows us to keep information about which dataset we are on in URL
  fixedEncodeURI(str) {
    return encodeURIComponent(str)
  }
  
  //Truncate the Rank Value
  precise(x) {
    return Number.parseFloat(x).toFixed(2);
  }



}

