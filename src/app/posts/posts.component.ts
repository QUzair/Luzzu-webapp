import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';
import {MatSliderModule} from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material.module';
import { FormsModule, FormControl } from '@angular/forms'
import { map, startWith } from 'rxjs/operators'
import 'hammerjs';
import {MatRadioModule} from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface RankOption{
  RankName: string,
  RankType:string,
  Description: string,
  Weights: any[]
}


@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})

export class PostsComponent implements OnInit {

  rankCtrl = new FormControl()
  filteredOptions: Observable<RankOption[]>;

  
  showSaveRanking = true
  showRankOption = false
  showSpinner = true;
  rank=false

	posts$:Object
  DisplayRank:RankOption

	request = []
  Configs = []
  metricURIs= []
  ranks: string[] = ['Categories', 'Dimensions', 'Metrics'];

  rankingType: string;
  dat = {type:"",uri:"",weight:0};
  

  NameForm= new FormControl()
  DescriptionForm = new FormControl()

  rankingOptions:RankOption[] = [
 {
    RankName:"Testing",
    RankType:"Categories",
    Description:"Currently being used to test the two available datasets",
    Weights:[
    {Label:"Contextual",Value:1},
    {Label:"Representational",Value:0},
    {Label:"Intrinsic",Value:0}]
  },
   {
    RankName:"Kitgo Datasets",
    RankType:"Categories",
    Description:"Ranking Datasets based on their Contextual and Representaional Value",
    Weights:[
    {Label:"Contextual",Value:0.5},
    {Label:"Representational",Value:0.5},
    {Label:"Intrinsic",Value:0}
    ]
  },
  {
    RankName:"Library Datasets Rank",
    RankType:"Dimensions",
    Description:"Ranking Datasets based on their Understandability and Interpretability",
    Weights:[
    {Label:"Understandability",Value:0.5},
    {Label:"Interpretability",Value:0.5}
    ]
  },
   {
    RankName:"Metrics Ranking Option",
    RankType:"Metrics",
    Description:"Metrics Ranking based on No Blank Node, Undefined Classes and Basic Provenance Metric",
    Weights:[
    {Label:"No blank node metric",Value:0.25},
    {Label:"Undefined classes and properties metric",Value:0.25},
    {Label:"Basic Provenance Metric",Value:0.5}
    ]
  }
  ]

  constructor(private data: DataService) { 
          this.filteredOptions = this.rankCtrl.valueChanges
      .pipe(
        startWith(''),
        map(res => res ? this._filterOptions(res) : this.rankingOptions.slice())
      );
    }

  ngOnInit() {
    this.data.getConfigurations().subscribe((res)=>{
      this.Configs = res
      let p = this.Configs.filter(res=>res.Name=="Posts")
      let sr = p[0].Elements.filter(res=>res.Name=="Save_Ranking")
      this.showSaveRanking = !sr[0].Disable
    })
  	this.loadfacets()
  }


  loadfacets(){
  	this.data.getFacets()
  	.subscribe(
  		data => {
        this.showSpinner = false;
  			this.posts$ = (data.Categories)
  			console.log(this.posts$)
        let defaultw = 1/data.Categories.length

        for(let c in this.posts$){
          console.log(`Label: ${this.posts$[c].label}`)
          Object.defineProperty(this.posts$[c],'weight',{
            value: defaultw,
            writable:true,
            configurable:true
          });

          for(let d in this.posts$[c].Dimensions){
            Object.defineProperty(this.posts$[c].Dimensions[d],'weight',{
              value: 0,
              writable:true,
              configurable:true
            });

            for(let m in this.posts$[c].Dimensions[d].Metrics){
              this.metricURIs.push((this.posts$[c].Dimensions[d].Metrics[m].uri))
            Object.defineProperty(this.posts$[c].Dimensions[d].Metrics[m],'weight',{
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
      for(let d in this.posts$[c].Dimensions){ 
        dimsum+=this.posts$[c].Dimensions[d].weight
          for(let m in this.posts$[c].Dimensions[d].Metrics){
            metsum+=this.posts$[c].Dimensions[d].Metrics[m].weight
          }
        }
    }
    if(this.rankingType=='Categories'){
      if(catsum==1){
        return true
      }
      else return false
    }

    if(this.rankingType=='Dimensions'){
      if(catsum==1 && dimsum==1){
        return true
      }
      else return false
    }
    if(this.rankingType=='Metrics'){
      if(catsum==1 && dimsum==1 && metsum==1){
        return true
      }
      else return false
    }
  }

  changeWeights(rankOption){
    this.showRankOption = true
    this.rankingType = rankOption.RankType
    this.DisplayRank = rankOption

    console.log(rankOption)
    if(rankOption.RankType=="Categories"){
      for(let c in this.posts$){  
        for(let ro in rankOption.Weights)
        if(this.posts$[c].Label == rankOption.Weights[ro].Label)
          this.posts$[c].weight = rankOption.Weights[ro].Value
      }
    }
    else if(rankOption.RankType=="Dimensions"){
      let sum=0
            for(let c in this.posts$){  
              for(let d in this.posts$[c].Dimensions){
                for(let ro in rankOption.Weights){
                  if(this.posts$[c].Dimensions[d].Label == rankOption.Weights[ro].Label){
                    this.posts$[c].Dimensions[d].weight = rankOption.Weights[ro].Value
                    sum+=rankOption.Weights[ro].Value
                  }
                }
              }
              this.posts$[c].weight=sum
              console.log(sum)
              console.log(this.posts$[c].Label)
              sum=0
            }
    }
    else if(rankOption.RankType=="Metrics"){
      let sumc=0
      let sumd=0
            for(let c in this.posts$){  
              for(let d in this.posts$[c].Dimensions){
                for(let m in this.posts$[c].Dimensions[d].Metrics){
                    for(let ro in rankOption.Weights){
                      if(this.posts$[c].Dimensions[d].Metrics[m].Label == rankOption.Weights[ro].Label){
                        this.posts$[c].Dimensions[d].Metrics[m].weight = rankOption.Weights[ro].Value
                        sumd+=rankOption.Weights[ro].Value
                      }
                  }
                }
                this.posts$[c].Dimensions[d].weight=sumd
                sumc+=sumd
                sumd=0
              }
              this.posts$[c].weight=sumc
              console.log(sumc)
              console.log(this.posts$[c].Label)
              sumc=0
              sumd=0
            }
    }
  }

  private _filterOptions(value: string): RankOption[] {
    let filterValue = value.toLowerCase();
    return this.rankingOptions.filter(res => res.RankName.toLowerCase().indexOf(filterValue) === 0);
  }

  SavingRanking(){
    let newRank = this.data.SaveRankOption(this.posts$,this.rankingType,this.NameForm.value,this.DescriptionForm.value)
    console.log(newRank)
    this.rankingOptions.push(newRank)
  }



}





