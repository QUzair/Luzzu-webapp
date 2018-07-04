import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

interface data {
	category: Object
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

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }
  rankedUsers = []
  datasetLabel = "Nothing";
  dat = {type:"",uri:"",weight:0};
  getDatasetLabel(){
  	return this.datasetLabel
  }

   setDatasetLabel(label){
  	 this.datasetLabel = label
  }

	getUsers(){
  	return this.http.get('https://jsonplaceholder.typicode.com/users')
  }

	getProfile(id){
  	return this.http.get('https://jsonplaceholder.typicode.com/users')
  }

//Getting Ranking Values or datasets
  getRanks(body){
  	return this.http.post<RankedUsers>('http://0.0.0.0:8080/Luzzu/rank',body)
  }



//GettingFacetoptions
	getFacets(){
  	return this.http.get<data>('http://0.0.0.0:8080/Luzzu/framework/web/get/facet/options')
	}

	getRanking(){
	return this.http.get<State[]>("/assets/data/rankedDatasets1.json")
	}

  getLODdata(){
  return this.http.get<LOD[]>("/assets/data/LODdata.json")
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
        console.log(res)
        this.rankedUsers=res.ranking
      })
       
  }


  }

