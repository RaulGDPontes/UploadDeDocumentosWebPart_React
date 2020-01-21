import * as React from 'react';
import styles from './UploadDeDocumentos.module.scss';
import { IListagemDeDocumentoProps } from './IListagemDeDocumentoProps';
import { IListagemDeDocumentoState } from './IListagemDeDocumentoState';
import getAjax from '../../../Helper/requisicaoAjax';
import Documento from '../../../Models/documento';

export class ListagemDeDocumento extends React.Component<IListagemDeDocumentoProps, IListagemDeDocumentoState, {}> {

  constructor(props) {
    super(props);
    this.state = {
      documentos: [],
      mensagemDeErro: "",
      ultimoOrdenado: "",
    };
  }

  public componentDidMount() {
    getAjax("https://microservicebnu.sharepoint.com/sites/Onboarding/_api/Web/Lists/getByTitle('Colaboradores')/Items?").then(result =>{console.log(result)})
    //colunaId,coluna/Title => expand coluna
    let documentosAjax = Array<Documento>();
    let endereco: string = this.props.siteUrl;
    //let endereco: string = this.context.pageContext.web.absoluteUrl;
    //let endereco: string = "https://microservicebnu.sharepoint.com/dev/LabDev";
    let url: string = `${endereco}/_api/Web/Lists/getByTitle('${this.props.listaDeDocumentos}')/Items?$select=Title,Id`;
    let url2: string = `${endereco}/_api/Web/Lists/getByTitle('${this.props.bibliotecaDeDocumento}')/Items?$filter=${this.props.colunaUsuario}/EMail eq '${this.props.idUsuario}'&$select=Id,${this.props.colunaDocumento}Id,File&$expand=File&$orderby=Id desc'`;
    let requisicoes = [getAjax(url), getAjax(url2)];
    Promise.all(requisicoes).then(result => {
      (result[0] as Array<any>).forEach(element => {
        let urlDocumento: string;
        let ServerRelativeUrl: string;
        let pendente: string = "Pendente";
        let busca = (result[1] as Array<any>).find(x => { return x[this.props.colunaDocumento + "Id"] == element.Id; });
        if (busca) {
          if (busca.File.LinkingUri) {
            urlDocumento = busca.File.LinkingUri;
          } else {
            urlDocumento = this.props.siteUrl.replace(/(?:.com)(.+)/, `.com/${busca.File.ServerRelativeUrl}`);
          }
          ServerRelativeUrl = busca.File.ServerRelativeUrl;
          pendente = "Ok";
        }
        documentosAjax.push(new Documento(element.Id, element.Title, urlDocumento, pendente, ServerRelativeUrl));
      });
      this.setState({
        documentos: documentosAjax
      });
    }).catch(e => {
      console.log(e);
      this.props.handler("erro");
    });
  }

  public popUp(url: string) {
    window.open(url, 'popUpWindow', 'height=600,width=500,left=100,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no, status=yes');
  }

  public atualizar(Id: string, tipoItem: string, serverRelativeUrl: string) {
    this.props.handler("atualizar", Id, tipoItem, serverRelativeUrl);
  }

  public sort(propriedade: string) {
    let documentos: Array<Documento>;
    let ultimoSorteado: string = this.state.ultimoOrdenado;
    switch (propriedade) {
      case "Status":
        if (ultimoSorteado != "StatusAsc") {
          documentos = this.state.documentos.sort((a, b) => (a.entregue > b.entregue) ? 1 : -1);
          ultimoSorteado = "StatusAsc";
        } else {
          documentos = this.state.documentos.sort((a, b) => (a.entregue < b.entregue) ? 1 : -1);
          ultimoSorteado = "StatusDesc";
        }
        break;

      case "Documento":
        if (this.state.ultimoOrdenado != "DocumentoAsc") {
          documentos = this.state.documentos.sort((a, b) => (a.tipo > b.tipo) ? 1 : -1);
          ultimoSorteado = "DocumentoAsc";
        } else {
          documentos = this.state.documentos.sort((a, b) => (a.tipo < b.tipo) ? 1 : -1);
          ultimoSorteado = "DocumentoDesc";
        }
        break;
    }

    this.setState({
      documentos: documentos,
      ultimoOrdenado: ultimoSorteado
    });
  }

  public organizar(e) {
    if (e.target.tagName == "SPAN" && (e.target.innerText == "Documento" || e.target.innerText == "Status")) {
      this.sort(e.target.innerText);
    }
  }

  public render(): React.ReactElement<IListagemDeDocumentoProps> {
    return (
      <div className={styles.uploadDeDocumentos}>
        <div className={styles.container}>
          <div className={styles.row}>
            <table className={styles.tabela}>
              <thead onClick={(e) => {
                this.organizar(e);
              }}>
                <th><span className={styles.sortable}>Documento</span></th>
                <th><span className={styles.sortable}>Status</span></th>
                <th><span>Ação</span></th>
              </thead>
              <tbody>
                {this.state.mensagemDeErro != "" ?
                  <tr><td colSpan={3}>{this.state.mensagemDeErro}</td></tr> :
                  this.state.documentos.map(item => {
                    return (
                      <tr>
                        <td>{item.tipo}</td>
                        <td>{item.entregue}</td>
                        <td>{item.url != null ?
                          <span className={styles.spanNavegacao} onClick={() => { event.preventDefault(); return this.popUp(item.url); }}>Visualizar / </span>
                          : ""}<span className={styles.spanNavegacao} onClick={() => { event.preventDefault(); return this.atualizar(item.id, item.tipo, item.ServerRelativeUrl); }}>Atualizar</span>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
