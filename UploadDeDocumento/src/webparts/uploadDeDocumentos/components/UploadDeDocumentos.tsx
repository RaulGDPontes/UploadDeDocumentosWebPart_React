import * as React from 'react';
import { IUploadDeDocumentosProps } from './IUploadDeDocumentosProps';
import { IUploadDeDocumentosState } from './IUploadDeDocumentosState';
import { UploadDeDocumentoForm } from './UploadDeDocumentoForm';
import { ListagemDeDocumento } from './ListagemDeDocumento';
import styles from './UploadDeDocumentos.module.scss';

export default class UploadDeDocumentos extends React.Component<IUploadDeDocumentosProps, IUploadDeDocumentosState, {}> {


  constructor(props) {
    super(props);
    this.handler = this.handler.bind(this);
    this.state = {
      formulario: "lista",
      documento: "",
      tipoDoDocumento: "",
      ServerRelativeUrl: "",
    };
  }

  // public componentDidMount() {

  // }
  public handler(val: string, documentoId: string, documentoTipo: string, enderecoRelativo: string) {
    this.setState({
      formulario: val,
      documento: documentoId,
      tipoDoDocumento: documentoTipo,
      ServerRelativeUrl: enderecoRelativo
    });
  }

  public render(): React.ReactElement<IUploadDeDocumentosProps> {

    switch (this.state.formulario) {
      case "lista":
        return (
          <div>
            <ListagemDeDocumento
              siteUrl={this.props.siteUrl}
              idUsuario={this.props.idUsuario}
              listaDeDocumentos={this.props.listaDeDocumentos}
              bibliotecaDeDocumento={this.props.bibliotecaDeDocumento}
              handler={this.handler}
              colunaUsuario={this.props.colunaUsuario}
              colunaDocumento={this.props.colunaDocumento}
            />
          </div>
        );
        break;

      case "atualizar":
        return (
          <div>
            <UploadDeDocumentoForm
              tipoDoDocumento={this.state.tipoDoDocumento}
              siteUrl={this.props.siteUrl}
              ServerRelativeUrl={this.state.ServerRelativeUrl}
              idDocumento={this.state.documento}
              idUsuario={this.props.idUsuario}
              bibliotecaDeDocumento={this.props.bibliotecaDeDocumento}
              handler={this.handler}
              colunaUsuario={this.props.colunaUsuario}
              colunaDocumento={this.props.colunaDocumento}
            />
          </div>
        );
        break;

      case "erro":
        return (
          <div className={styles.uploadDeDocumentos} >
            <div className={styles.container}>
              <div className={styles.row}>
                <h1>Necessário configurações</h1>
                 Olá. Caso esteja vendo esta mensagem, alguns passos ainda são necessários para a utilização desta WebPart.
               <ul>
                  <li>Possuir uma lista com os documentos</li>
                  <li>Possuir uma biblioteca de documentos com as colunas para Usuario do tipo Pessoa (Apenas uma pessoa)
                    e de consulta para o tipo de documento
                  </li>
                  <li>
                    Informar os respectivos nomes das colunas e listas nas configurações da WebPart
                  </li>
                  <li>Após a alteração das configurações, é necessário recarregar a pagina</li>
                </ul>
              </div>
            </div>
          </div>
          // mensagemDeErro: `Para a utilização correta desta WebPart é necessário algumas configurações.
          //     Deve-se ter uma lista com os documentos requisitados, que será usada como referencia para a listagem.
          //     Uma biblioteca com um campo para pessoas, com a configuração para somente uma pessoa, e um campo de consulta
          //     referenciando o tipo de documento.
          //      Nas configurações da WebPart, digite o nome da lista de documentos, o nome da biblioteca, o nome da coluna contendo
          //      o usuario na biblioteca de documentos, e o nome da coluna contento o tipo de documento na biblioteca.`,
        );
        break;
    }
  }
}
