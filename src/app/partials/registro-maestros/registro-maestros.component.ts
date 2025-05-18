import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaestroService } from 'src/app/services/maestros.service'; // Servicio del maestro
declare var $: any;
import { ActivatedRoute } from '@angular/router'; // Para obtener parámetros de la ruta

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss']
})
export class RegistroMaestrosComponent implements OnInit {
  @Input() rol: string = ""; // Rol asignado
  @Input() datos_user: any = {}; // Datos adicionales del usuario

  public user: any = {}; // Datos del formulario
  public errors: any = {}; // Almacena errores del formulario
  public editar: boolean = false; // Indica si estamos en modo de edición
  public idUser: number = 0; // ID del usuario
  public token: string = ""; // Token de sesión
  

  // Propiedades para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  // Propiedades para materias y materias seleccionadas
  public materiasCheckbox: { value: string, nombre: string }[] = [
    { value: '1', nombre: 'Aplicaciones Web' },
    { value: '2', nombre: 'Programación 1' },
    { value: '3', nombre: 'Bases de datos' },
    { value: '4', nombre: 'Tecnologías Web' },
    { value: '5', nombre: 'Minería de datos' },
    { value: '6', nombre: 'Desarrollo móvil' },
    { value: '7', nombre: 'Estructuras de datos' },
    { value: '8', nombre: 'Administración de redes' },
    { value: '9', nombre: 'Ingeniería de Software' },
    { value: '10', nombre: 'Administración de S.O.' },
  ];
  public selectedMaterias: string[] = [];

  constructor(
    private maestroService: MaestroService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
  if (this.activatedRoute.snapshot.params['id'] !== undefined) {
    this.editar = true;
    this.idUser = this.activatedRoute.snapshot.params['id'];
    console.log("ID user: ", this.idUser);

    // Supongamos que los datos del usuario se reciben en this.datos_user
    this.user = this.datos_user;

    // Si se tiene la fecha de nacimiento como string, la convertimos a Date
    if (this.user.fecha_nacimiento) {
      this.user.fecha_nacimiento = this.parseLocalDate(this.user.fecha_nacimiento);
    }
  } else {
    // Inicializamos el objeto maestro para el registro
    this.user = this.maestroService.esquemaMaestro();
    this.user.rol = this.rol;
  }
  console.log("Datos iniciales del maestro:", this.user);
}


  // Mostrar/ocultar contraseña
  showPassword(): void {
    this.inputType_1 = this.inputType_1 === 'password' ? 'text' : 'password';
    this.hide_1 = !this.hide_1;
  }

  showPwdConfirmar(): void {
    this.inputType_2 = this.inputType_2 === 'password' ? 'text' : 'password';
    this.hide_2 = !this.hide_2;
  }

  public regresar(): void {
    console.log("Regresando a la pantalla anterior...");
    this.router.navigate(['/']);
  }

  public registrar(): void {
  if (this.user.fecha_nacimiento instanceof Date) {
    this.user.fecha_nacimiento = this.user.fecha_nacimiento.toISOString().split('T')[0];
  }
  console.log("Fecha antes de validar:", this.user.fecha_nacimiento);

  this.errors = this.maestroService.validarMaestro(this.user, this.editar);
  if (Object.keys(this.errors).length !== 0) {
    console.log("Errores encontrados en el formulario:", this.errors);
    return;
  }
  console.log("Datos preparados para enviar al backend:", this.user);
  this.maestroService.registrarMaestro(this.user).subscribe(
    response => {
      console.log("Registro exitoso:", response);
      alert("Registro exitoso!");
      this.router.navigate(['/home']);
    },
    error => {
      console.error("Error al registrar el maestro:", error);
      this.errors = error.error;
    }
  );
}

  
  public actualizar(): void {
  // Convertir fecha_nacimiento a string si es un objeto Date
  if (this.user.fecha_nacimiento instanceof Date) {
    this.user.fecha_nacimiento = this.user.fecha_nacimiento.toISOString().split('T')[0];
  }

  // Inicia y valida errores
  this.errors = this.maestroService.validarMaestro(this.user, this.editar);
  if (!$.isEmptyObject(this.errors)) {
    return;
  }
  console.log("Pasó la validación");

  // Llama al servicio para actualizar el maestro
  this.maestroService.editarMaestro(this.user).subscribe(
    response => {
      alert("Maestro editado correctamente");
      console.log("Maestro editado: ", response);
      this.router.navigate(['/home']);
    },
    error => {
      alert("No se pudo editar el maestro");
      console.error("Error al editar maestro", error);
    }
  );
}


  public checkboxChange(event: any): void {
    const materiaNombre = event.source.value;
    if (event.checked) {
      if (!this.user.materias_json) {
        this.user.materias_json = [];
      }
      this.user.materias_json.push(materiaNombre);
    } else {
      this.user.materias_json = this.user.materias_json.filter(materia => materia !== materiaNombre);
    }
    console.log("Materias en JSON:", this.user.materias_json);
  }

  // Reemplaza la función revisarSeleccion existente por esta nueva implementación
  public revisarSeleccion(nombre: string): boolean {
    return this.user && this.user.materias_json && this.user.materias_json.includes(nombre);
  }

  public soloLetras(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (!(charCode >= 65 && charCode <= 90) && !(charCode >= 97 && charCode <= 122) && charCode !== 32) {
      event.preventDefault();
    }
  }

  private parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Recuerda que en JavaScript el mes se indexa desde 0
  return new Date(year, month - 1, day);
}

}
