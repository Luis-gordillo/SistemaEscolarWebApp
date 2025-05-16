import { Component, Input, OnInit } from '@angular/core';
declare var $: any;
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit{
  @Input() tipo: string = "";
  @Input() rol:string ="";

  public token : string = "";
  public editar:boolean = false;

  constructor(
    private router: Router,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService
  ){}

  ngOnInit() {
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();

    // Detecta la ruta actual y asigna 'tipo'
    this.router.events.subscribe(event => {
      if (this.router.url.includes('registro-usuarios')) {
        this.tipo = 'registro-usuarios' ;
      } else if (this.router.url.includes('registro-eventos')) {
        this.tipo = 'registro-eventos';
      } else {
        this.tipo = '';
      }
    });

    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
    }

  }

  public logout(){

  }

  public goRegistro(){
    this.router.navigate(["registro-usuarios"]);
  }


  public clickNavLink(link: string){
    this.router.navigate([link]);
    setTimeout(() => {
      this.activarLink(link);
    }, 100);
  }

public activarLink(link: string){
  if(link == "alumnos"){
    $("#principal").removeClass("active");
    $("#maestro").removeClass("active");
    $("#alumno").addClass("active");
  } else if(link == "maestros"){
    $("#principal").removeClass("active");
    $("#alumno").removeClass("active");
    $("#maestro").addClass("active");
  } else if(link == "home"){
    $("#alumno").removeClass("active");
    $("#maestro").removeClass("active");
    $("#principal").addClass("active");
  } else if(link == "graficas"){
    $("#alumno").removeClass("active");
    $("#maestro").removeClass("active");
    $("#principal").removeClass("active");
    $("#graficas").addClass("active");
  } else if(link == "eventos"){
    // Remover la clase 'active' de los demás links según corresponda
    $("#alumno").removeClass("active");
    $("#maestro").removeClass("active");
    $("#principal").removeClass("active");
    $("#graficas").removeClass("active");
    // Agregar la clase 'active' al elemento con id "evento"
    $("#evento").addClass("active");
  }
}

}