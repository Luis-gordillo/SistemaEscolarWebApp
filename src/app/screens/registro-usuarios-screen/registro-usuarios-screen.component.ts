import { Component, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AdministradorService } from 'src/app/services/administradores.service';
import { AlumnoService } from 'src/app/services/alumnos.service';
import { MaestroService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-usuarios-screen',
  templateUrl: './registro-usuarios-screen.component.html',
  styleUrls: ['./registro-usuarios-screen.component.scss']
})
export class RegistroUsuariosScreenComponent implements OnInit{

  public tipo:string = "registro-usuarios";
  public idUser:any = {};
  public editar:boolean = false;
  //Banderas para el tipo de usuario
  public isAdmin:boolean = false;
  public isAlumno:boolean = false;
  public isMaestro:boolean = false;
  public rol:string = "";
  public tipo_user:string = "";
  public user:any = {};

  constructor(
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    private administradorService: AdministradorService,
    private alumnoService: AlumnoService,
    private maestroService: MaestroService
  ){}

  ngOnInit(): void {
    if(this.activatedRoute.snapshot.params['rol'] != undefined){
      this.rol = this.activatedRoute.snapshot.params['rol'];
      console.log("Rol detect: ", this.rol);
    }
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);

      this.obtenerUserByID();

    }
  }

  public obtenerUserByID(){
    if(this.rol == "administrador"){
      this.administradorService.getAdminByID(this.idUser).subscribe(
        (response)=>{
          this.user = response;
          this.user.first_name  = response.user.first_name;
          this.user.last_name = response.user.last_name;
          this.user.email = response.user.email;
          this.user.tipo_usuario = this.rol;
          this.isAdmin = true;

          console.log("Datos User: ", this.user);
        }, (error)=>{
          alert("No se pudo obtener el usuario");
    }
  );
} else if (this.rol == "maestro") {
  this.maestroService.getMaestroByID(this.idUser).subscribe(
    (response) => {
      this.user = response;
      this.user.first_name = response.user.first_name;
      this.user.last_name = response.user.last_name;
      this.user.email = response.user.email;
      this.user.tipo_usuario = this.rol;
      this.isMaestro = true;

      console.log("Datos User (Maestro): ", this.user);
    },
    (error) => {
      alert("No se pudo obtener el usuario maestro");
    }
  );
  }else if(this.rol == "alumno"){
    this.alumnoService.getAlumnoByID(this.idUser).subscribe(
      (response)=>{
        this.user = response;
        this.user.first_name  = response.user.first_name;
        this.user.last_name = response.user.last_name;
        this.user.email = response.user.email;
        this.user.tipo_usuario = this.rol;
        this.isAlumno = true;

        console.log("Datos User (Alumno): ", this.user);
      }, (error)=>{
        alert("No se pudo obtener el usuario alumno");
      }
    );
  }
};

  public radioChange(event: MatRadioChange) {
    if(event.value == "administrador"){
      this.isAdmin = true;
      this.tipo_user = "administrador"
      this.isAlumno = false;
      this.isMaestro = false;
    }else if (event.value == "alumno"){
      this.isAdmin = false;
      this.isAlumno = true;
      this.tipo_user = "alumno"
      this.isMaestro = false;
    }else if (event.value == "maestro"){
      this.isAdmin = false;
      this.isAlumno = false;
      this.isMaestro = true;
      this.tipo_user = "maestro"
    }
  }
}
