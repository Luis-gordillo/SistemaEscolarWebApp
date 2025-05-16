import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlumnoService } from 'src/app/services/alumnos.service'; // Servicio del alumno
declare var $: any;
import { ActivatedRoute } from '@angular/router'; // Para obtener parámetros de la ruta

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit {
  @Input() rol: string = ""; // Rol asignado
  @Input() datos_user: any = {}; // Datos adicionales del usuario

  public user: any = {}; // Almacena los datos del formulario
  public errors: any = {}; // Almacena errores del formulario
  public editar: boolean = false; // Indica si estamos en modo de edición
  public idUser: number = 0; // ID del usuario
  public token: string = ""; // Token de sesión

  // Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private alumnoService: AlumnoService, // Inyectamos el servicio para alumnos
    private router: Router, // Para navegar entre rutas
    private activatedRoute: ActivatedRoute, // Para obtener parámetros de la ruta
  ) {}

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params['id'] !== undefined) {
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID user: ", this.idUser);
      this.user = this.datos_user;
    } else {
      this.user = this.alumnoService.esquemaAlumno();
      this.user.rol = this.rol;
    }
    console.log("Datos iniciales del maestro:", this.user);
  }

  // Mostrar/ocultar contraseña
  showPassword(): void {
    if (this.inputType_1 === 'password') {
      this.inputType_1 = 'text';
      this.hide_1 = true;
    } else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar(): void {
    if (this.inputType_2 === 'password') {
      this.inputType_2 = 'text';
      this.hide_2 = true;
    } else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  // Redirigir al usuario a otra página
  public regresar(): void {
    this.router.navigate(['/']); // Redirige a la página principal
  }

  public registrar(): void {
    // 🛠 Convertir la fecha antes de validar
    if (this.user.fecha_nacimiento instanceof Date) {
        this.user.fecha_nacimiento = this.user.fecha_nacimiento.toISOString().split('T')[0];
    }

    console.log("Fecha antes de validar:", this.user.fecha_nacimiento);

    // Validar el formulario
    this.errors = this.alumnoService.validarAlumno(this.user, this.editar);

    if (Object.keys(this.errors).length !== 0) {
        console.log("Errores encontrados en el formulario:", this.errors);
        return;
    }

    console.log("Datos preparados para enviar al backend:", this.user);

    // Enviar los datos al backend
    this.alumnoService.registrarAlumno(this.user).subscribe(
        response => {
            console.log("Registro exitoso:", response);
            alert("Registro exitoso!");
            this.router.navigate(['/home']);
        },
        error => {
            console.error("Error al registrar el alumno:", error);
            this.errors = error.error;
        }
    );
}




public actualizar(): void {
  // Limpiar o inicializar los errores
  this.errors = [];

  // Validar datos usando el método de alumnos
  this.errors = this.alumnoService.validarAlumno(this.user, this.editar);
  if (!$.isEmptyObject(this.errors)) {
    // Si hay errores, se detiene la ejecución
    return;
  }
  console.log("Pasó la validación");

  // Llamar al servicio para editar el alumno
  this.alumnoService.editarAlumno(this.user).subscribe(
    response => {
      alert("Alumno editado correctamente");
      console.log("Alumno editado: ", response);
      this.router.navigate(['/home']);
    },
    error => {
      alert("No se pudo editar el alumno");
      console.error("Error al editar alumno", error);
    }
  );
}

  // Permitir solo letras en los campos de texto
  public soloLetras(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Validar si el carácter es una letra o un espacio
    if (
      !(charCode >= 65 && charCode <= 90) && // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32 // Espacio
    ) {
      event.preventDefault();
    }
  }
}
