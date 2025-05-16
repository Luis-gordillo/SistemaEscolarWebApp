import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

declare var $:any;

@Component({
  selector: 'app-registro-admin',
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.scss']
})
export class RegistroAdminComponent implements OnInit{
  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public admin:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public idUser:number = 0;
  public token:string = "";

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private administradoresService: AdministradorService,
    private router: Router,
    private facadeService: FacadeService,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ){}

  ngOnInit(): void {
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;

      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID user: ", this.idUser);

      this.admin = this.datos_user;
    }
    else{
      this.admin = this.administradoresService.esquemaAdmin();
      this.admin.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    console.log("Admin:")
  }

  //Funciones para password
  showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public regresar(){

    this.router.navigate(['/']);
  }

  public registrar() {
    // Validación del formulario
    this.errors = [];
  
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if (!$.isEmptyObject(this.errors)) {
      return false;
    }
  
    // Enviar los datos al servidor
    console.log('Datos a enviar:', this.admin); // Agregar mensaje de consola
    this.administradoresService.registrarAdmin(this.admin).subscribe(
      response => {
        console.log('Registro exitoso', response); // Agregar mensaje de consola
        // Redirigir al usuario a otra página, por ejemplo:
        this.router.navigate(['/home']);
      },
      error => {
        console.error('Error en el registro', error); // Agregar mensaje de consola
        this.errors = error;
      }
    );
  }

  public actualizar(){

    this.errors = [];

    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if (!$.isEmptyObject(this.errors)) {
      return false;
    }
    console.log("Pasó la validación");

    this.administradoresService.editarAdmin(this.admin).subscribe(
      response => {
        alert("Administrador editado correctamente");
        console.log("Admin editado: ", response);
        this.router.navigate(['/home']);
      }, (error) => {
        alert("No se pudo editar el administrador");
      }
    );
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }
}
