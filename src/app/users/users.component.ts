import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

// export class State {
//   constructor(public 'Dataset-PLD': string, public graphUri: string, public rankedValue: number) {
//    }
// }

interface State {
  'Dataset-PLD':string,
  'Graph-URI':string,
  'Rank-Value':number
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

export class UsersComponent implements OnInit {

  showSpinner = true
	users$:State[]
  states:State[]
  label = 'Label';
  stateCtrl: FormControl;
  filteredStates: Observable<any[]>;

  constructor(private data: DataService) { 
    this.stateCtrl = new FormControl();
    this.filteredStates = this.stateCtrl.valueChanges
      .pipe(
        startWith(''),
        map(state => state ? this.filterStates(state) : this.states.slice())
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

  setLabel(label){
    this.data.changeLabel(label)
  }

  filterStates(name: string) {
    return this.states.filter(state =>
      state['Dataset-PLD'].toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

}

