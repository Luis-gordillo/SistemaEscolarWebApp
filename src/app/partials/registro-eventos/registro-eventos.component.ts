import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { EventosService } from 'src/app/services/eventos.service';
import { FacadeService } from 'src/app/services/facade.service';
import { forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AdministradorService} from 'src/app/services/administradores.service';
import { MaestroService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-eventos',
  templateUrl: './registro-eventos.component.html',
  styleUrls: ['./registro-eventos.component.scss']
})
export class RegistroEventosComponent implements OnInit {

  public evento: any = {
    nombre: '',
    fecha_realizacion: '',
    descripcion: '',
    hora_inicio: null,
    hora_fin: null,
    publico: [] // <-- Agrega esta propiedad para guardar el público seleccionado
  };

  public event: any = {}; // Almacena los datos del formulario
  public errors: any = {};
  public editar: boolean = false;
  public idUser: number = 0;
  public token: string = "";
  public tipo_evento: string = "";
  public fechaActual: Date = new Date();
  public horarioValido: boolean = true;
  public rol: string = "";
  public tipo:string = "registro-usuarios";
  public listaResponsables: any[] = [];
  public lista_admins: any[] = [];
  public lista_maestros: any[] = [];

  // Opciones para el público objetivo
  public publicoOpciones: string[] = ['Estudiantes', 'Profesores', 'Público general'];
  // Arreglo para almacenar las opciones seleccionadas
  public publicoSeleccionado: string[] = [];

  constructor(
    private eventosService: EventosService,
    private router: Router,
    private facadeService: FacadeService,
    private location: Location,
    private administradorService: AdministradorService,
    private maestroService: MaestroService,
    private activatedRoute: ActivatedRoute,
  ) {}

ngOnInit(): void {
  // ... otras inicializaciones
  this.rol = this.facadeService.getUserGroup() || 'admin';
  this.token = this.facadeService.getSessionToken() || '';

  if (this.activatedRoute.snapshot.params['id'] !== undefined) {
    this.editar = true;
    const eventId = this.activatedRoute.snapshot.params['id'];
    this.eventosService.getEventoByID(eventId).subscribe(
      response => {
        // Asigna la respuesta directamente a this.evento.
        this.evento = response;

        // Parseamos la fecha de realización como fecha local usando la función auxiliar
        if (response.fecha_realizacion) {
          this.evento.fecha_realizacion = this.parseLocalDate(response.fecha_realizacion);
        }

        // Transforma el tiempo para que se muestre en formato "HH:mm"
        this.evento.horaInicio = response.horaInicio 
          ? response.horaInicio.substring(0, 5)
          : '';
        this.evento.horaFin = response.horaFin 
          ? response.horaFin.substring(0, 5)
          : '';

        // Convertir el responsable a número, si es necesario:
        this.evento.responsable = response.responsable ? Number(response.responsable) : null;

        // Si el público llega como string, conviértelo a arreglo...
        if (response.publico_objetivo) {
          this.publicoSeleccionado = typeof response.publico_objetivo === 'string'
            ? [response.publico_objetivo]
            : response.publico_objetivo;
          this.evento.publico = this.publicoSeleccionado;
        }
      },
      error => {
        console.error("Error al cargar el evento para edición:", error);
      }
    );
  } else {
    // Lógica para modo registro (nuevo evento)
  }
  
  // Cargar responsables u otras inicializaciones
  this.cargarResponsables();
}

// Función auxiliar para convertir una cadena "YYYY-MM-DD" en un objeto Date local
private parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // new Date(año, mesIndexado desde 0, día)
  return new Date(year, month - 1, day);
}



  validarFechaRealizacion() {
    if (!this.evento.fecha_realizacion) {
      this.errors.fecha_realizacion = "Debes seleccionar una fecha de realización.";
    } else if (new Date(this.evento.fecha_realizacion) < this.fechaActual) {
      this.errors.fecha_realizacion = "No puedes seleccionar una fecha anterior al día actual.";
    } else {
      delete this.errors.fecha_realizacion;
    }
  }

guardarHorario() {
  this.errors = {}; // Limpia errores previos
  let { horaInicio, horaFin } = this.evento;

  if (!horaInicio) {
    this.errors.horaInicio = "La hora de inicio es obligatoria.";
  }
  if (!horaFin) {
    this.errors.horaFin = "La hora de finalización es obligatoria.";
  }
  
  if (horaInicio && horaFin) {
    // Agregar validación para evitar error si horaInicio o horaFin son undefined:
    if ((horaInicio && horaInicio.toUpperCase && horaInicio.toUpperCase().includes('AM')) ||
        (horaInicio && horaInicio.toUpperCase && horaInicio.toUpperCase().includes('PM'))) {
      horaInicio = this.convertTime12to24(horaInicio);
      horaFin = this.convertTime12to24(horaFin);
    }
    
    const inicio = new Date(`1970-01-01T${horaInicio}:00`);
    const fin = new Date(`1970-01-01T${horaFin}:00`);
    
    if (inicio >= fin) {
      this.errors.horaFin = "La hora final debe ser posterior a la hora inicial.";
    } else {
      this.evento.hora_inicio = horaInicio;
      this.evento.hora_fin = horaFin;
      this.evento.horaInicio = horaInicio;
      this.evento.horaFin = horaFin;
    }
  }
  
  if (Object.keys(this.errors).length === 0) {
    console.log("Horario validado y guardado:", this.evento);
  }
}


private formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

private convertTime12to24(time12h: string): string {
  // Si no se recibe ningún valor, retorna cadena vacía
  if (!time12h) {
    return '';
  }
  
  // Separar la cadena por espacios; si no tenemos dos partes (tiempo y modificador), retorna el valor
  const parts = time12h.trim().split(' ');
  if (parts.length < 2) {
    return time12h;
  }
  
  const [time, modifier] = parts;
  let [hours, minutes] = time.split(':');

  // Asegurarse de que modifier esté definido
  if (!modifier) {
    return time12h;
  }

  if (modifier.toUpperCase() === 'PM' && hours !== '12') {
    hours = String(parseInt(hours, 10) + 12);
  }
  if (modifier.toUpperCase() === 'AM' && hours === '12') {
    hours = '00';
  }
  return `${hours}:${minutes}`;
}



public registrar() {
  // Primero, valida la fecha y el horario
  this.validarFechaRealizacion();
  this.guardarHorario();

  // Sólo si no hay errores en la validación
  if (Object.keys(this.errors).length === 0) {
    // Prepara el payload final
    const payload: any = {
      nombre: this.evento.nombre,
      // Si fecha_realizacion es un objeto Date, conviértelo:
      fecha_realizacion: this.evento.fecha_realizacion instanceof Date
        ? this.formatDate(this.evento.fecha_realizacion)
        : this.evento.fecha_realizacion,
      descripcion: this.evento.descripcion,
      // Usa las propiedades ya convertidas o definidas:
      hora_inicio: this.evento.hora_inicio || this.evento.horaInicio || '',
      hora_fin: this.evento.hora_fin || this.evento.horaFin || '',
      cupo_asistentes: this.evento.cupoAsistentes,
      lugar: this.evento.lugar,
      programa_educativo: this.evento.programaEducativo,
      // El backend espera "publico_objetivo"
      publico_objetivo: this.evento.publico,  // o this.evento.publico_objetivo si ya la asignaste
      responsable: this.evento.responsable,
      tipo: this.evento.tipo  // O, si usas otro campo, actualízalo acá
    };

    console.log("Payload a enviar:", payload);
    // Llama al servicio con el payload preparado
    this.eventosService.registrarEvento(payload).subscribe(
      response => {
        console.log("Evento registrado:", response);
      },
      error => {
        console.log("Error al registrar el evento:", error);
      }
    );
  } else {
    console.log("Errores en el formulario:", this.errors);
  }
}

  public onPublicoChange(event: any): void {
    const opcion = event.source.value;
    if (event.checked) {
      if (!this.publicoSeleccionado.includes(opcion)) {
        this.publicoSeleccionado.push(opcion);
      }
    } else {
      this.publicoSeleccionado = this.publicoSeleccionado.filter(item => item !== opcion);
    }
    this.evento.publico = this.publicoSeleccionado;
    console.log("Público seleccionado:", this.publicoSeleccionado);
  }

  public isPublicoSelected(opcion: string): boolean {
    return this.publicoSeleccionado.includes(opcion);
  }

  public validarDescripcion(event: KeyboardEvent): void {
    if (event.key.length > 1) {
      return;
    }
    const regex = /^[A-Za-z0-9\s\.\,\:\;\!\?\'\"\-]+$/;
    const key = event.key;
    
    if (!regex.test(key)) {
      event.preventDefault();
    }
  }
  public validarSoloNumeros(event: KeyboardEvent): void {
    // Permitir teclas de control
    if (event.key.length > 1) {
      return;
    }
    const regex = /^[0-9]$/;
    const key = event.key;
    if (!regex.test(key)) {
      event.preventDefault();
    }
  }
    public regresar(){
    this.router.navigate(['/']);
  }



public actualizar(): void {
  // Se validan la fecha y el horario, tal como se hace en registrar()
  this.validarFechaRealizacion();
  this.guardarHorario();

  if (Object.keys(this.errors).length !== 0) {
    console.log("Errores en el formulario:", this.errors);
    return;
  }

  console.log("Pasó la validación del evento", this.evento);

  // Aseguramos que la fecha se envíe en formato YYYY-MM-DD:
  let fechaEnvio: string = '';
  if (this.evento.fecha_realizacion) {
    // Si la fecha es un objeto Date, se aplica el formateo; de lo contrario, se intenta parsear como Date local
    if (this.evento.fecha_realizacion instanceof Date) {
      fechaEnvio = this.formatDate(this.evento.fecha_realizacion);
    } else {
      const fecha = new Date(this.evento.fecha_realizacion);
      fechaEnvio = this.formatDate(fecha);
    }
  }

  // Para las horas, usamos la propiedad ya asignada por guardarHorario().
  // Notar que el backend espera las claves en camelCase: "horaInicio" y "horaFin"
  const horaInicioFinal = this.evento.hora_inicio || this.evento.horaInicio || '';
  const horaFinFinal = this.evento.hora_fin || this.evento.horaFin || '';

  // Para "publico_objetivo", si el valor es un array (posiblemente anidado) lo aplanamos y unimos por comas.
  let publicoFinal: string = '';
  if (Array.isArray(this.evento.publico)) {
    // Si es un array anidado, lo aplanamos (por ejemplo, [["Estudiantes"]])
    publicoFinal = this.evento.publico.flat().join(',');
  } else {
    publicoFinal = this.evento.publico;
  }

  const payload: any = {
    id: this.evento.id,  // Campo necesario para la actualización
    nombre: this.evento.nombre,
    fecha_realizacion: fechaEnvio,
    descripcion: this.evento.descripcion,
    horaInicio: horaInicioFinal,  // Enviamos con clave camelCase
    horaFin: horaFinFinal,
    cupoAsistentes: this.evento.cupoAsistentes,
    lugar: this.evento.lugar,
    programaEducativo: this.evento.programaEducativo,
    publico_objetivo: publicoFinal,
    responsable: this.evento.responsable,
    tipo: this.evento.tipo
  };

  console.log("Payload a enviar:", payload);

  this.eventosService.editarEvento(payload).subscribe(
    response => {
      alert("Evento editado correctamente");
      console.log("Evento editado:", response);
      this.router.navigate(['/home']);
    },
    error => {
      alert("No se pudo editar el evento");
      console.error("Error al editar evento", error);
    }
  );
}



private cargarResponsables(): void {
  forkJoin({
    admins: this.administradorService.obtenerListaAdmins(),
    maestros: this.maestroService.obtenerListaMaestros()
  }).subscribe(
    ({ admins, maestros }) => {
      this.lista_admins = admins;
      this.lista_maestros = maestros;

      admins.forEach((usuario: any) => {
        usuario.first_name = usuario.user.first_name;
        usuario.last_name = usuario.user.last_name;
        usuario.tipoRol = 'Administrador';
        usuario.matricula = usuario.clave_admin; // Asignamos clave_admin a la propiedad "matricula"
      });

      maestros.forEach((usuario: any) => {
        usuario.first_name = usuario.user.first_name;
        usuario.last_name = usuario.user.last_name;
        usuario.email = usuario.user.email;
        usuario.tipoRol = 'Maestro';
        usuario.matricula = usuario.id_trabajador; // Usamos id_trabajador como "matrícula"
      });

      this.listaResponsables = [...admins, ...maestros];

      this.listaResponsables.sort((a: any, b: any) =>
        a.first_name.localeCompare(b.first_name)
      );
      console.log("Lista combinada de responsables:", this.listaResponsables);
    },
    error => {
      console.error("No se pudo obtener la lista de responsables:", error);
      alert("No se pudo cargar la lista de responsables");
    }
  );
}

private formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}


}


