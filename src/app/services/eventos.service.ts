import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';
import { FacadeService } from './facade.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) {}

  // Esquema inicial para el formulario de eventos
  public esquemaEvento() {
  return {
    'nombre': '',              // Nombre del evento
    'tipo': '',                // Tipo de evento (Conferencia, Taller, etc.)
    'fecha_realizacion': '',   // Fecha en formato YYYY-MM-DD
    'horaInicio': '',          // Hora de inicio en formato HH:MM (o el que manejes)
    'horaFin': '',             // Hora de fin
    'lugar': '',               // Lugar del evento
    'publico_objetivo': [],    // Público objetivo, se puede almacenar como un array
    'programaEducativo': '',   // Programa educativo (la carrera)
    'responsable': '',         // Responsable del evento (id o nombre)
    'descripcion': '',         // Descripción breve (máximo 300 caracteres)
    'cupoAsistentes': ''       // Cupo máximo de asistentes (valor numérico o string, segun necesidad)
  };
}


  public validarEvento(data: any, editar: boolean): any {
  console.log("Validando evento...", data);
  let error: any = [];

  // Nombre del evento
  if (!this.validatorService.required(data["nombre"])) {
    error["nombre"] = this.errorService.required;
  }

  // Tipo de evento
  if (!this.validatorService.required(data["tipo"])) {
    error["tipo"] = this.errorService.required;
  }

  // Fecha de realización: requerido y formato YYYY-MM-DD
  if (!this.validatorService.required(data["fecha_realizacion"])) {
    error["fecha_realizacion"] = this.errorService.required;
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data["fecha_realizacion"])) {
    error["fecha_realizacion"] = "La fecha debe estar en formato YYYY-MM-DD";
  }

  // Hora de inicio
  if (!this.validatorService.required(data["horaInicio"])) {
    error["horaInicio"] = this.errorService.required;
  }

  // Hora de fin
  if (!this.validatorService.required(data["horaFin"])) {
    error["horaFin"] = this.errorService.required;
  }

  // Validación cruzada: la hora de inicio debe ser menor que la de fin
  if (data["horaInicio"] && data["horaFin"]) {
    // Convertir las horas a un objeto Date (se asume formato HH:MM, se le asigna una fecha fija)
    let ini = new Date("1970-01-01T" + data["horaInicio"] + ":00");
    let fin = new Date("1970-01-01T" + data["horaFin"] + ":00");
    if (ini >= fin) {
      error["horaInicio"] = "La hora de inicio debe ser menor que la de fin";
    }
  }

  // Lugar
  if (!this.validatorService.required(data["lugar"])) {
    error["lugar"] = this.errorService.required;
  }

  // Público objetivo: se asume que es un array con los elementos seleccionados
  if (!data["publico_objetivo"] || data["publico_objetivo"].length === 0) {
    error["publico_objetivo"] = "Debe seleccionar al menos un público objetivo";
  }

  // Programa educativo
  if (!this.validatorService.required(data["programaEducativo"])) {
    error["programaEducativo"] = this.errorService.required;
  }

  // Responsable del evento
  if (!this.validatorService.required(data["responsable"])) {
    error["responsable"] = this.errorService.required;
  }

  // Descripción breve: requerida y con máximo 300 caracteres
  if (!this.validatorService.required(data["descripcion"])) {
    error["descripcion"] = this.errorService.required;
  } else if (!this.validatorService.max(data["descripcion"], 300)) {
    error["descripcion"] = this.errorService.max(300);
  }

  // Cupo máximo de asistentes: requerido, debe ser numérico y mayor o igual a 0
  if (!this.validatorService.required(data["cupoAsistentes"])) {
    error["cupoAsistentes"] = this.errorService.required;
  } else if (!this.validatorService.numeric(data["cupoAsistentes"])) {
    error["cupoAsistentes"] = "El valor debe ser un número";
  } else if (data["cupoAsistentes"] < 0) {
    error["cupoAsistentes"] = "El cupo debe ser un número entero positivo";
  } else if (data["cupoAsistentes"].toString().length > 3) {
    error["cupoAsistentes"] = "El cupo máximo de asistentes debe ser menor a 1000";
  }

  // Retornar el objeto de errores (si está vacío, la validación fue exitosa)
  return error;
}


  // Registrar evento
  public registrarEvento(data: any): Observable<any> {
    return this.http.post<any>(`${environment.url_api}/eventos/`, data, httpOptions);
  }

  // Obtener lista de eventos
  public obtenerListaEventos(): Observable<any> {
  const token = this.facadeService.getSessionToken();
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  });
  return this.http.get<any>(`${environment.url_api}/eventos/`, { headers: headers });
}


  // Obtener evento por ID
  public getEventoByID(id: number): Observable<any> {
    return this.http.get<any>(`${environment.url_api}/eventos/?id=${id}`, httpOptions);
  }

  public editarEvento(data: any): Observable<any> {
  const token = this.facadeService.getSessionToken();
  const headers = new HttpHeaders({ 
    'Content-Type': 'application/json', 
    'Authorization': 'Bearer ' + token 
  });
  return this.http.put<any>(`${environment.url_api}/eventos-edit/`, data, { headers });
}


  // Eliminar evento con autenticación
public eliminarEvento(id: number): Observable<any> {
  const token = this.facadeService.getSessionToken();
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  });
  return this.http.delete<any>(`${environment.url_api}/eventos-edit/?id=${id}`, { headers: headers });
}

}