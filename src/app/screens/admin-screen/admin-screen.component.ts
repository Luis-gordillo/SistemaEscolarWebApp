import { Component, OnInit } from '@angular/core';
import { FacadeService } from 'src/app/services/facade.service';
import { Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administradores.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss']
})
export class AdminScreenComponent implements OnInit{

  public name_user: string = "";
  public lista_admins:any[]= [];

  constructor(
    private facadeService: FacadeService,
    private administradoresService: AdministradorService,
    private router: Router,
    private dialog: MatDialog,
  ) { }
  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.obtenerAdmins();
  }

  public goEditar(idUser: number){
    this.router.navigate(["registro-usuarios/administrador/"+idUser]);
  }

  public delete(idUser: number){
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: {id: idUser, rol: "administrador"},
        height: '288px',
        width: '320px',
  });
      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
        console.log("Admin eliminado");  
          window.location.reload();
        }else{
          alert("Administrador no eliminado");
          console.log("No se elimino el admin");
        }}
      ); 
      }
      
    
    //Obtener lista de usuarios
    public obtenerAdmins(){
      this.administradoresService.obtenerListaAdmins().subscribe(
        (response)=>{
          this.lista_admins = response;
          console.log("Lista users: ", this.lista_admins);
        }, (error)=>{
          alert("No se pudo obtener la lista de admins");
        }
      );
    }
  
}
