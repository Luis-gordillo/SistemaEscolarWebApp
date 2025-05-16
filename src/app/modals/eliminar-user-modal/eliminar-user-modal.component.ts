import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdministradorService } from 'src/app/services/administradores.service';
import { AlumnoService } from 'src/app/services/alumnos.service';
import { MaestroService } from 'src/app/services/maestros.service';
import { EventosService } from 'src/app/services/eventos.service'; // Importa el servicio de eventos

@Component({
  selector: 'app-eliminar-user-modal',
  templateUrl: './eliminar-user-modal.component.html',
  styleUrls: ['./eliminar-user-modal.component.scss']
})
export class EliminarUserModalComponent implements OnInit {

  public rol: string = "";

  constructor(
    private administradoresService: AdministradorService,
    private maestroService: MaestroService,
    private alumnoService: AlumnoService,
    private eventosService: EventosService, // Inyecta el servicio de eventos
    private dialogRef: MatDialogRef<EliminarUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.rol = this.data.rol;
  }

  public cerrar_modal() {
    this.dialogRef.close({ isDelete: false });
  }

  public eliminarUser() {
    if (this.rol == "administrador") {
      this.administradoresService.eliminarAdmin(this.data.id).subscribe(
        (response) => {
          console.log(response);
          this.dialogRef.close({ isDelete: true });
        }, (error) => {
          this.dialogRef.close({ isDelete: false });
        }
      );
    } else if (this.rol == "maestro") {
      this.maestroService.eliminarMaestro(this.data.id).subscribe(
        (response) => {
          console.log(response);
          this.dialogRef.close({ isDelete: true });
        }, (error) => {
          this.dialogRef.close({ isDelete: false });
        }
      );
    } else if (this.rol == "alumno") {
      this.alumnoService.eliminarAlumno(this.data.id).subscribe(
        (response) => {
          console.log(response);
          this.dialogRef.close({ isDelete: true });
        }, (error) => {
          this.dialogRef.close({ isDelete: false });
        }
      );
    } else if (this.rol == "evento") {                     // Nueva condición para eventos
      this.eventosService.eliminarEvento(this.data.id).subscribe(
        (response) => {
          console.log("Evento eliminado:", response);
          this.dialogRef.close({ isDelete: true });
        }, (error) => {
          console.error("Error al eliminar el evento:", error);
          this.dialogRef.close({ isDelete: false });
        }
      );
    }
  }
}
