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

  constructor(private data: DataService) { 

    }


  ngOnInit() {
  	this.loadfacets()
  }

  loadfacets(){
  	this.data.getFacets()
  	.subscribe(
  		data => {
  			this.posts$ = (data.category)
  			console.log(this.posts$)

        for(let c in this.posts$){
          console.log(`Label: ${this.posts$[c].label}`)
          Object.defineProperty(this.posts$[c],'weight',{
            value: 0,
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

/*
 AssembleRequest(){
    console.log(`starting ranking...`)
    console.log(this.posts$)
    let da = this.dat
    da.type = "category"
    let dad = this.dat
    let dam = this.dat

    if(this.rankingType=='Categories'){
      for(let c in this.posts$){  
        da.uri = this.posts$[c].uri
        da.weight = this.posts$[c].weight
        console.log(da)
        if(!this.request.includes(da)) this.request.push(da)  
        console.log(this.request)

          for(let d in this.posts$[c].dimension){ 
            for(let m in this.posts$[c].dimension[d].metric){
            }
          }
       }
     }

    else if(this.rankingType=='Dimensions'){
      for(let c in this.posts$){  
          for(let d in this.posts$[c].dimension){ 
            da.type = "dimension"
            da.uri = this.posts$[c].dimension[d].uri
            da.weight = this.posts$[c].dimension[d].weight
            console.log(da)
            if(!this.request.includes(da)) this.request.push(da)  
          }
       }
     }

    else if(this.rankingType=='Metrics'){
      for(let c in this.posts$){  
          for(let d in this.posts$[c].dimension){ 
            for(let m in this.posts$[c].dimension[d].metric){
                da.type = "metric"
                da.uri = this.posts$[c].dimension[d].metric[m].uri
                da.weight = this.posts$[c].dimension[d].metric[m].weight
                console.log(da)
                if(!this.request.includes(da)) this.request.push(da)  
                console.log(this.request)
            }
          }
       }
     }
     
      console.log(this.request)
      console.log("here")
      console.log(JSON.stringify(this.request))
      
    //Send req
     this.data.getRanks(JSON.stringify(this.request))
       .subscribe(
           data => {this.res = data
             console.log(this.res)
           }
        )
  }
*/
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





