import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss']
})
export class EventosScreenComponent implements OnInit, AfterViewInit {
  public name_user: string = "";
  public rol: string = "";
  public lista_eventos: any[] = [];
  public token: string = "";

  // Definir columnas: ajusta el orden o nombres según tu template HTML
  displayedColumns: string[] = [
    'nombre', 'tipo', 'fecha_realizacion', 'horaInicio', 'horaFin',
    'lugar', 'cupoAsistentes', 'programaEducativo', 
    'publico_objetivo', 'editar', 'eliminar'
  ];
  dataSource = new MatTableDataSource<DatosEvento>(this.lista_eventos as DatosEvento[]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private facadeService: FacadeService,
    private router: Router,
    private eventosService: EventosService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Recuperar datos del usuario y token
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();
    if(this.token === ""){
      this.router.navigate([""]);
    }
    this.obtenerEventos();
    this.initPaginator();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // Configura el paginador y traduce las etiquetas a español
  public initPaginator(): void {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.paginator._intl.itemsPerPageLabel = 'Registros por página';
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
        if (length === 0 || pageSize === 0) {
          return `0 / ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} de ${length}`;
      };
      this.paginator._intl.firstPageLabel = 'Primera página';
      this.paginator._intl.lastPageLabel = 'Última página';
      this.paginator._intl.previousPageLabel = 'Página anterior';
      this.paginator._intl.nextPageLabel = 'Página siguiente';
    }, 500);
  }

  // Obtiene la lista de eventos del servicio
  public obtenerEventos(): void {
    this.eventosService.obtenerListaEventos().subscribe(
      (response) => {
        this.lista_eventos = response;
        console.log("Lista de eventos: ", this.lista_eventos);
        if (this.lista_eventos.length > 0) {
          // Aquí podrías hacer formateos o ajustes adicionales a cada evento si es necesario.
          this.dataSource = new MatTableDataSource<DatosEvento>(this.lista_eventos as DatosEvento[]);
        }
      }, (error) => {
        alert("No se pudo obtener la lista de eventos.");
      }
    );
  }

public goEditar(idEvent: number): void {
  if (idEvent == null || idEvent === undefined) {
    console.error('ID del evento es undefined:', idEvent);
    return;
  }
  this.router.navigate(["registro-eventos", idEvent]).then(success => {
    console.log('Navigated to registro-eventos with id:', idEvent);
  }).catch(err => {
    console.error('Navigation error:', err);
  });
}
  public delete(idEvento: number): void {
  const dialogRef = this.dialog.open(EliminarUserModalComponent, {
    data: { id: idEvento, tipo: "evento" }, // aquí puedes cambiar "tipo" o "rol" según lo que necesites
    height: '288px',
    width: '320px',
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result.isDelete) {
      console.log("Evento eliminado");
      window.location.reload();
    } else {
      alert("Evento no eliminado");
      console.log("No se eliminó el evento");
    }
  });
}


  
  
  }
  
// Interfaz que define la estructura de un evento (ajusta los tipos de datos según corresponda)
export interface DatosEvento {
  id: number;
  nombre: string;
  tipo: string;
  fecha_realizacion: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  descripcion: string;
  cupoAsistentes: number;
  programaEducativo: string;
  // Para 'responsable' puedes implementar un nested object con más datos de usuario o almacenar solo el id; ajústalo según tu API
  //responsable: any; 
  // Suponemos que 'publico_objetivo' se guarda como cadena (por ejemplo, "Estudiantes,Profesores")
  publico_objetivo: string;
}
