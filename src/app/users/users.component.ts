import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

export class State {
  constructor(public dataset: string, public graphUri: string, public rankedValue: number) {
   }
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

export class UsersComponent implements OnInit {

	users$:State[]
  states: State[] = [];
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
  	//Accessing properties, subscribe to the observable and bound the data
  	/*this.data.getRanking().subscribe(
      (data)=>{
        this.users$ = data
        console.log(this.users$)
        this.states = this.users$
      }
    )*/
    console.log(this.users$)

    setInterval(() => {
    this.update(); 
  }, 5000);
    
  }

  setLabel(label){
    console.log(`Sent ${label}`)
    this.data.datasetLabel = label
  }

  filterStates(name: string) {
    return this.states.filter(state =>
      state.dataset.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  update(){
    this.users$ = this.data.rankedUsers
    this.states = this.users$
  }

}
