import { Component, OnInit } from '@angular/core';
import { FacadeService } from 'src/app/services/facade.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss']
})
export class HomeScreenComponent implements OnInit {
  
  public rol : string = ""
  constructor(
    private facadeService: FacadeService,
    private router: Router
    
  ) { }


  ngOnInit(): void {
    this.rol = this.facadeService.getUserGroup();
    console.log("Rol: ", this.rol);
  }

  public logout(){
    this.facadeService.logout().subscribe(
      (response)=>{
        console.log("Entró a cerrar sesión",response);
        this.facadeService.destroyUser();
        //Navega al login
        this.router.navigate(["/"]);
      }, (error)=>{
        console.log(error);
  }
 );
}
}
