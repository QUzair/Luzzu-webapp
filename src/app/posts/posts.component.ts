import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';
import {MatSliderModule} from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material.module';
import { FormsModule} from '@angular/forms'
import { map } from 'rxjs/operators'
import 'hammerjs';

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
  public name = "Uzair";
  metricURIs= []

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

 AssembleRequest(){
    console.log(`starting ranking...`)
    console.log(this.posts$)
    let da = this.dat

    for(let c in this.posts$){  
      da.type = "category"
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


  }





    
            
      //   }



