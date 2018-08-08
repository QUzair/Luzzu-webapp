import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
};

 interface RankOption{
  RankName: string,
  RankType:string,
  Description: string,
  Weights: any[]
}

interface data {
	Categories: Object[]
}

interface MetricData {
  Category: string,
  Dimension: string,
  'Metric-Label':string,
  'Metric-URI':string,
  Observations:any[]
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

  private Metric_profile_name = new BehaviorSubject('');
  CurrentMetric = this.Metric_profile_name.asObservable();

  constructor(private http: HttpClient) { }

  dat = {type:"",uri:"",weight:0};

  standardRank = [{"type":"category","uri":"http://purl.org/eis/vocab/dqm#Contextual","weight":0.25},{"type":"category","uri":"http://purl.org/eis/vocab/dqm#Accessibility","weight":0.25},{"type":"category","uri":"http://purl.org/eis/vocab/dqm#Representational","weight":0.25},{"type":"category","uri":"http://purl.org/eis/vocab/dqm#Intrinsic","weight":0.25}]

  getRanks(body){
    console.log(body)
  	return this.http.post<Object[]>('http://0.0.0.0:8080/Luzzu/v4/dataset/rank/weighted',body)
  }


  // getRanks(req){
  //     const body = new HttpParams()
  //   .set(' ',req)

  //   console.log(body)
  //       return this.http.post<Object[]>('http://localhost:8080/Luzzu/v4/dataset/rank/weighted/',
  //   body.toString(),
  //   {
  //     headers: new HttpHeaders()
  //       .set('Content-Type', 'application/json')
  //   }
  // );
  // }


  //http://localhost:8080/Luzzu/v4/dataset/rank
//http://0.0.0.0:8080/Luzzu/v4/dataset/rank/weighted/
	getFacets(){
  	return this.http.get<data>('http://0.0.0.0:8080/Luzzu/v4/framework/filtering-facets/')
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
        dad.uri = posts$[c].URI
        dad.weight = posts$[c].weight
        console.log(dad)
        if(posts$[c].weight>0) request.push(dad)  
        console.log(request)
       }
     }
    else if(rankingType=='Dimensions'){
      for(let c in posts$){  
          for(let d in posts$[c].Dimensions){ 
            let da = {type:"",uri:"",weight:0};
            da.type = "dimension"
            da.uri = posts$[c].Dimensions[d].URI
            da.weight = posts$[c].Dimensions[d].weight
            console.log(da)
            request.push(da)  
            console.log(request)
          }
       }
     }
    else if(rankingType=='Metrics'){
      for(let c in posts$){  
          for(let d in posts$[c].Dimensions){ 
            for(let m in posts$[c].Dimensions[d].Metrics){
              let da = {type:"",uri:"",weight:0};
                da.type = "metric"
                da.uri = posts$[c].Dimensions[d].Metrics[m].URI
                da.weight = posts$[c].Dimensions[d].Metrics[m].weight
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

  SaveRankOption(posts$,rankType,rankName,rankDescription){
    console.log(posts$)
    console.log(rankType)
    console.log(rankName)
    console.log(rankDescription)

    var temp:RankOption = {RankName:"Nothing",Description:"Also Nothing", RankType:"Categories",Weights:[]}
    let arr = []
   // let temparr:{Label:string,Value:number} = {Label:"Nothing",Value:0}

     if(rankType=="Categories"){
      for(let c in posts$){  
        if(posts$[c].weight>0){
          let temparr:{Label:string,Value:number} = {Label:"Nothing",Value:0}
          temparr.Label = posts$[c].Label
          temparr.Value = posts$[c].weight
          arr.push(temparr)
        }
      }
    }
    else if(rankType=="Dimensions"){
      for(let c in posts$){  
        for(let d in posts$[c].Dimensions){
          if(posts$[c].Dimensions[d].weight>0){
            let temparr:{Label:string,Value:number} = {Label:"Nothing",Value:0}
            temparr.Label = posts$[c].Dimensions[d].Label
            temparr.Value = posts$[c].Dimensions[d].weight
            arr.push(temparr)
          }
        }
      }
    }
    else if(rankType=="Metrics"){
      for(let c in posts$){  
        for(let d in posts$[c].Dimensions){
          for(let m in posts$[c].Dimensions[d].Metrics){
            if(posts$[c].Dimensions[d].Metrics[m].weight>0){
              let temparr:{Label:string,Value:number} = {Label:"Nothing",Value:0}
              temparr.Label = posts$[c].Dimensions[d].Metrics[m].Label
              temparr.Value = posts$[c].Dimensions[d].Metrics[m].weight
              arr.push(temparr)
            }
          }
        }
      }
    } 
    console.log(arr) 
    temp.RankName = rankName
    temp.Description = rankDescription
    temp.RankType = rankType
    temp.Weights = arr
    console.log(temp)
    return temp

  }

  changeLabel(newLabel: string) {
    this.Profile_Label.next(newLabel)
  }

  changeMetricName(metric:any){
    console.log(metric)
    this.Metric_profile_name.next(metric)
  }

  getStandardRanks(){
    return this.getRanks(this.standardRank)
  }

  getProfileObservation(label,uri): Observable<any> {
  const body = new HttpParams()
    .set('Dataset-PLD', label)
    .set('Observation',uri)

  return this.http.post('http://0.0.0.0:8080/Luzzu/v4/metric/observation/profile',
    body.toString(),
    {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }
  );
  }

  getAssessmentdates(label): Observable<any> {
  const body = new HttpParams()
    .set('Dataset-PLD', label);

  return this.http.post('http://0.0.0.0:8080/Luzzu/v4/dataset/assessment-dates',
    body.toString(),
    {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }
  );
  }

    MetricsForDated(pld,date): Observable<any> {
  const body = new HttpParams()
    .set('Dataset-PLD', pld)
    .set('Date',date);

  return this.http.post('http://0.0.0.0:8080/Luzzu/v4/dataset/quality/',
    body.toString(),
    {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }
  );
  }

  }

