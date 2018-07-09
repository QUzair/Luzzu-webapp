import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs';

interface data {
	category: Object[]
}


interface RankedUsers {
  ranking: Object[]
}


interface assessdata {
  Results: Object[]
}

export class State {
  constructor(public dataset: string, public graphUri: string, public rankedValue: number) {
   }
}

export class LOD {
  constructor(public name: string, public comment: string, public mean: number, public std: number) {
   }
}

export class MT {
  constructor(public dataset: string, public metrics: Object[]) {
   }
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private rankedUsers = new BehaviorSubject([]);
  currentRankedUsers = this.rankedUsers.asObservable();

  private Profile_Label = new BehaviorSubject('No label selected');
  Current_Label = this.Profile_Label.asObservable();

  private Users_Spinner = new BehaviorSubject(true);
  CurrentSpinner = this.Users_Spinner.asObservable();

  constructor(private http: HttpClient) { }

  dat = {type:"",uri:"",weight:0};

  standardRank = [{"type":"category","uri":"http://purl.org/eis/vocab/dqm#Contextual","weight":0.25},{"type":"category","uri":"http://purl.org/eis/vocab/dqm#Accessibility","weight":0.25},{"type":"category","uri":"http://purl.org/eis/vocab/dqm#Representational","weight":0.25},{"type":"category","uri":"http://purl.org/eis/vocab/dqm#Intrinsic","weight":0.25}]

  getRanks(body){
  	return this.http.post<Object[]>('http://localhost:8080/Luzzu/v4/dataset/rank',body)
  }

	getFacets(){
  	return this.http.get<data>('http://localhost:8080/Luzzu/framework/web/get/facet/options')
	}

	getRanking(){
	return this.http.get<State[]>("/assets/data/rankedDatasets1.json")
	}

  getLODdata(){
  return this.http.get<LOD[]>("/assets/data/LODdata.json")
  }

  getMetricThresholdData(){
    return this.http.get<MT[]>("/assets/data/Metrics_Threshholds.json")
  }

  getpending(){
    return this.http.get<assessdata>('http://localhost:8080/Luzzu/v4/assessment/pending')
  }

  getfailed(){
    return this.http.get<assessdata>('http://localhost:8080/Luzzu/v4/assessment/failed')
  }

  getsuccessful(){
    return this.http.get<assessdata>('http://localhost:8080/Luzzu/v4/assessment/successful')
  }

   AssembleRequest(posts$,rankingType){
    console.log(`starting ranking...`)
    console.log(posts$)
    let request= []

    if(rankingType=='Categories'){
      for(let c in posts$){ 
        let dad = {type:"",uri:"",weight:0};
        dad.type = "category" 
        dad.uri = posts$[c].uri
        dad.weight = posts$[c].weight
        console.log(dad)
        request.push(dad)  
        console.log(request)
       }
     }
    else if(rankingType=='Dimensions'){
      for(let c in posts$){  
          for(let d in posts$[c].dimension){ 
            let da = {type:"",uri:"",weight:0};
            da.type = "dimension"
            da.uri = posts$[c].dimension[d].uri
            da.weight = posts$[c].dimension[d].weight
            console.log(da)
            request.push(da)  
            console.log(request)
          }
       }
     }
    else if(rankingType=='Metrics'){
      for(let c in posts$){  
          for(let d in posts$[c].dimension){ 
            for(let m in posts$[c].dimension[d].metric){
              let da = {type:"",uri:"",weight:0};
                da.type = "metric"
                da.uri = posts$[c].dimension[d].metric[m].uri
                da.weight = posts$[c].dimension[d].metric[m].weight
                console.log(da)
                request.push(da)  
                console.log(request)
            }
          }
       }
     }
     
      console.log(request)
      console.log("here")
      console.log(JSON.stringify(request))
      
    //Send req
      return this.getRanks(JSON.stringify(request)).subscribe((res)=>{
        this.rankedUsers.next(res)
        this.Users_Spinner.next(false)
        console.log(this.rankedUsers)
      })
       
  }

  changeLabel(newLabel: string) {
    this.Profile_Label.next(newLabel)
  }

  getStandardRanks(){
    return this.getRanks(this.standardRank)
  }


  }

