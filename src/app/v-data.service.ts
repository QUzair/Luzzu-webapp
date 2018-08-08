import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs' 


interface Vtime {
	metrics: Object,
	name: Object
}

interface VQuality {
	metrics: Object
}

@Injectable({
  providedIn: 'root'
})
export class VDataService {

  constructor(private _http: HttpClient) {}

vstime(label, metrics:string[]): Observable<any> {
    console.log(label)
    console.log(metrics)
  const body = new HttpParams()
    .set('dataset', label)
    .set('metrics', JSON.stringify(metrics));
  return this._http.post<Vtime>('http://0.0.0.0:8080/Luzzu/framework/web/post/visualisation/dstime',
    body.toString(),
    {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }
  );
}

//http://0.0.0.0:8080/Luzzu/v4/assessment/compute

vsQuality(label): Observable<any> {
  const body = new HttpParams()
    .set('Dataset-PLD', label);

  return this._http.post<Vtime>('http://0.0.0.0:8080/Luzzu/v4/dataset/latest',
    body.toString(),
    {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }
  );
  }

  LoadAssessMetrics(){
    return this._http.get('http://0.0.0.0:8080/Luzzu/v4/framework/available-metrics/')
  }

  MetricsForDate(pld,date): Observable<any> {
  const body = new HttpParams()
    .set('Dataset-PLD', pld)
    .set('Date',date);

  return this._http.post('http://0.0.0.0:8080/Luzzu/v4/dataset/quality/',
    body.toString(),
    {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }
  );
  }

Assess(dslocation,qr,mConfig,pld,sparql): Observable<any> {
  const body = new HttpParams()
    .set('Dataset-Location', dslocation)
    .set('Quality-Report-Required',qr)
    .set('Metrics-Configuration',mConfig)
    .set('Dataset-PLD',pld)
    .set('Is-Sparql-Endpoint',sparql);

  return this._http.post('http://0.0.0.0:8080/Luzzu/v4/assessment/compute',
    body.toString(),
    {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }
  );
  }
}


