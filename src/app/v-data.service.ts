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

  body_vstime = {dataset:"http://dbpedia.org/",
metrics:["http://purl.org/eis/vocab/dqm#RDFAvailabilityMetric","http://purl.org/eis/vocab/dqm#RDFAvailabilityMetric","http://purl.org/eis/vocab/dqm#DifferentSerialisationsMetric","http://purl.org/eis/vocab/dqm#CompatibleDatatype","http://purl.org/eis/vocab/dqm#UsageOfDeprecatedClassesOrProperties","http://purl.org/eis/vocab/dqm#ValidIFPUsageMetric","http://purl.org/eis/vocab/dqm#ExtensionalConcisenessMetric","http://purl.org/eis/vocab/dqm#MisplacedClassesOrPropertiesMetric","http://purl.org/eis/vocab/dqm#HighThroughputMetric","http://purl.org/eis/vocab/dqm#OntologyHijackingMetric","http://purl.org/eis/vocab/dqm#UntypedLiteralsMetric","http://purl.org/eis/vocab/dqm#EndPointAvailabilityMetric","http://purl.org/eis/vocab/dqm#EntitiesAsMembersOfDisjointClassesMetric","http://purl.org/eis/vocab/dqm#MisusedOwlDatatypeOrObjectPropertiesMetric","http://purl.org/eis/vocab/dqm#LowLatencyMetric","http://purl.org/eis/vocab/dqm#UsageOfIncorrectDomainOrRangeDatatypesMetric","http://purl.org/eis/vocab/dqm#UndefinedClassesAndPropertiesMetric","http://purl.org/eis/vocab/dqm#ScalabilityOfDataSourceMetric"]}

vstime(label, metrics:string[]): Observable<any> {
  const body = new HttpParams()
    .set('dataset', label)
    .set('metrics', JSON.stringify(metrics));

    console.log(metrics)
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
    .set('dataset', label);

  return this._http.post<Vtime>('http://0.0.0.0:8080/Luzzu/framework/web/post/visualisation/dsqualityvis',
    body.toString(),
    {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }
  );
  }

  LoadAssessMetrics(){
    return this._http.get('http://0.0.0.0:8080/Luzzu/framework/web/get/configured/metrics')
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


