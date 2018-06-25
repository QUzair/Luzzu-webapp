import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

interface data {
	category: Object
}

export class State {
  constructor(public dataset: string, public graphUri: string, public rankedValue: number) {
   }
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  datasetLabel = "Nothing";

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
  	return this.http.post('http://0.0.0.0:8080/Luzzu/rank',body)
  }



//GettingFacetoptions
	getFacets(){
  	return this.http.get<data>('http://0.0.0.0:8080/Luzzu/framework/web/get/facet/options')
	}

	getRanking(){
	return this.http.get<State[]>("/assets/data/rankedDatasets1.json")
	}


  }

