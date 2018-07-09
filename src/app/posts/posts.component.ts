import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';
import {MatSliderModule} from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material.module';
import { FormsModule} from '@angular/forms'
import { map } from 'rxjs/operators'
import 'hammerjs';
import {MatRadioModule} from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})

export class PostsComponent implements OnInit {

  rank=false
	posts$:Object
	request = []
  dat = {type:"",uri:"",weight:0};
  weight=0;
  res:Object 
  metricURIs= []
  rankingType: string;
  ranks: string[] = ['Categories', 'Dimensions', 'Metrics'];
  showSpinner = true;
  constructor(private data: DataService) { 

    }


  ngOnInit() {
  	this.loadfacets()
  }



  loadfacets(){
  	this.data.getFacets()
  	.subscribe(
  		data => {
        this.showSpinner = false;
  			this.posts$ = (data.category)
  			console.log(this.posts$)
        let defaultw = 1/data.category.length

        for(let c in this.posts$){
          console.log(`Label: ${this.posts$[c].label}`)
          Object.defineProperty(this.posts$[c],'weight',{
            value: defaultw,
            writable:true,
            configurable:true
          });

          for(let d in this.posts$[c].dimension){
            Object.defineProperty(this.posts$[c].dimension[d],'weight',{
              value: 0,
              writable:true,
              configurable:true
            });

            for(let m in this.posts$[c].dimension[d].metric){
              this.metricURIs.push((this.posts$[c].dimension[d].metric[m].uri))
            Object.defineProperty(this.posts$[c].dimension[d].metric[m],'weight',{
              value: 0,
              writable:true,
              configurable:true
            });
          }
          }
        }

    console.log(this.metricURIs)
    return this.metricURIs
  		}
  	)
  }

AssembleR(){
  this.data.AssembleRequest(this.posts$,this.rankingType)
}

  CategoryAdded(){
    let catsum=0
    let dimsum=0
    let metsum=0

    for(let c in this.posts$){  
       catsum+=this.posts$[c].weight
      for(let d in this.posts$[c].dimension){ 
        dimsum+=this.posts$[c].dimension[d].weight
          for(let m in this.posts$[c].dimension[d].metric){
            metsum+=this.posts$[c].dimension[d].metric[m].weight
          }
        }
    }
    if(this.rankingType=='Categories'){
      if(catsum==1){
                console.log(catsum)
        console.log(dimsum)
        console.log(metsum)
        return true
      }
      else return false
    }

    if(this.rankingType=='Dimensions'){
      if(catsum==1 && dimsum==1){
        console.log(catsum)
        console.log(dimsum)
        console.log(metsum)
        return true
      }
      else return false
    }
    if(this.rankingType=='Metrics'){
      if(catsum==1 && dimsum==1 && metsum==1){
        console.log(catsum)
        console.log(dimsum)
        console.log(metsum)
        return true
      }
      else return false
    }


  }


  }





