import * as React from 'react';
import styles from './UploadDeDocumentos.module.scss';
import { IUploadDeDocumentosFormProps } from './IUploadDeDocumentosFormProps';
import { IUploadDeDocumentosFormState } from './IUploadDeDocumentosFormState';
import getAjax from '../../../Helper/requisicaoAjax';
import * as $ from 'jquery';
import Iframe from 'react-iframe';
import { iniciarTimer } from '../../../Helper/timer';
//import { ListagemDeDocumento } from './ListagemDeDocumento';


export class UploadDeDocumentoForm extends React.Component<IUploadDeDocumentosFormProps, IUploadDeDocumentosFormState, {}> {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.uploadDocument = this.uploadDocument.bind(this);
    this.state = {
      arquivo: null,
      mensagemDeErro: "",
      carregandoArquivo: false,
      image: ""
    };
  }


  private enviar() {
    if (this.state.arquivo) {
      this.setState({
        carregandoArquivo: true
      });
      iniciarTimer.start();
      this.uploadDocument(this.state.arquivo, this.props.siteUrl, this.props.bibliotecaDeDocumento,
        this.props.idUsuario, this.props.idDocumento, this.props.tipoDoDocumento, this.props.colunaUsuario,
        this.props.colunaDocumento, this.props.ServerRelativeUrl, this.props.handler);
    } else {

      alert("Por favor, selecione um arquivo valido");
    }
  }


  public readURL(file: File) {
    if (file) {
      var reader = new FileReader();
      reader.onload = (e) => {
        //        if (file.name.toLowerCase().includes("jpg") || file.name.toLowerCase().includes("png")) {
        this.setState({
          arquivo: file,
          image: (e as any).target.result
        });
        // } else {
        //   this.setState({
        //     arquivo: file,
        //     image: ""
        //   });
        // }
      };
      reader.readAsDataURL(file);
    }
  }

  private handleChange(selectorFiles: FileList) {
    //    if (selectorFiles[0].name.toLowerCase().includes("jpg") || selectorFiles[0].name.toLowerCase().includes("png")) {
    this.readURL(selectorFiles[0]);
    // } else {
    //   this.setState({
    //     arquivo: null,
    //     image: ""
    //   });

    // }
  }

  private uploadDocument(arquivo, siteUrl, nomeDaLista, idUsuario, idTipo, tipoDoDocumento, colunaUsuario, colunaDocumento, ServerRelativeUrl, callback) {

    let urlBuscaUSuario: string = `${siteUrl}/_api/web/siteusers?$filter=Email eq '${idUsuario}'&$select= Id, Title`;
    let urlBuscaListas: string = `${siteUrl}/_api/Web/Lists/?$filter=Title eq '${this.props.bibliotecaDeDocumento}'&$select=ListItemEntityTypeFullName`;
    let buscaDados = [getAjax(urlBuscaUSuario), getAjax(urlBuscaListas)];
    $.ajax({
      url: siteUrl + "/_api/contextinfo",
      type: "POST",
      headers: {
        "accept": "application/json;odata=verbose",
        "contentType": "text/xml"
      },
      success: (data) => {
        //  let requestdigest = data;
        var formDigest = data.d.GetContextWebInformation.FormDigestValue;
        Promise.all(buscaDados).then(result => {
          var fileName = arquivo.name;
          var title = (`${fileName}`);
          var extensao = title.substring(title.indexOf("."), title.length);
          var nomeDoArquivo = `${idTipo}_${(result[0][0].Title).replace(/ /g, "")}${extensao}`;

          var reader = new FileReader();
          reader.onload = (e: any) => {
            if (ServerRelativeUrl) {
              DeletarItem();
            }
            addItem(e.target.result, nomeDoArquivo);
          };
          reader.onerror = (e: any) => {
            alert(e.target.error);
          };
          reader.readAsArrayBuffer(arquivo);
          function addItem(buffer, nomeDoArquivo1) {
            var call = uploadDocument(buffer, nomeDoArquivo1);
            call.then((data1: any) => {
              var call2 = getItem(data1.d);
              call2.then((data2: any) => {
                var item = data2.d;
                var call3 = updateItemFields(item, (result as Array<any>)[0][0].Id,
                  (result as Array<any>)[1][0].ListItemEntityTypeFullName);
                call3.then(() => {
                  iniciarTimer.stop();
                  callback("lista");
                });
                call3.catch((e) => {
                  failHandler(e);
                });
              });
              call2.catch((e) => {
                failHandler(e);
              });
            });
            call.catch((e) => {
              failHandler(e);
            });
          }
        });

        function DeletarItem() {
          var fullUrl = `${siteUrl}/_api/web/GetFileByServerRelativeUrl('${ServerRelativeUrl}')`;
          $.ajax({
            url: fullUrl,
            type: "POST",
            headers: {
              "accept": "application/json;odata=verbose",
              "content-type": "application/json;odata=verbose",
              "X-RequestDigest": formDigest,
              "X-HTTP-Method": "DELETE",
              "IF-MATCH": "*"
            },
            //success: function () { alert("foi") },
            error: () => { alert("Não foi possivel deletar o documento existente."); },
          });
        }

        function uploadDocument(buffer, fileNameUp) {
          var url = `${siteUrl}/_api/Web/Lists/getByTitle('${nomeDaLista}')/RootFolder/Files/Add(url='${fileNameUp}', overwrite=true)`;
          var call = $.ajax({
            url: url,
            type: "POST",
            data: buffer,
            processData: false,
            headers:
            {
              "Accept": "application/json;odata=verbose",
              "X-RequestDigest": formDigest,
            }
          });
          return call;
        }

        function getItem(file) {
          var call = $.ajax({
            url: file.ListItemAllFields.__deferred.uri,
            type: "GET",
            dataType: "json",
            headers: {
              Accept: "application/json;odata=verbose"
            }
          });
          return call;
        }

        function updateItemFields(item, idDoUsuario, nomeCompletoDaLista) {
          // const teste: string = "UsuarioId";
          // const teste2: string = "DocumentoId";
          var call = $.ajax({
            url: `${siteUrl}/_api/Web/Lists/getByTitle('${nomeDaLista}')/Items('${item.Id}')`,
            type: "POST",
            data: JSON.stringify({
              "__metadata": { type: `${nomeCompletoDaLista}` },
              'Title': "",
              [`${colunaUsuario}Id`]: `${idDoUsuario}`,
              [`${colunaDocumento}Id`]: `${idTipo}`
            }),
            headers: {
              Accept: "application/json;odata=verbose",
              "Content-Type": "application/json;odata=verbose",
              "X-RequestDigest": formDigest,
              "IF-MATCH": item.__metadata.etag,
              "X-Http-Method": "MERGE"
            }
          });
          return call;
        }
        function failHandler(e) {
        }
      },
      error: (err) => {
        alert(JSON.stringify(err));
      }
    });
  }

  public render(): React.ReactElement<IUploadDeDocumentosFormProps> {
    //if (true) {
    if (this.state.carregandoArquivo) {
      return (
        <div className={styles.uploadDeDocumentos} >
          <div className={styles.row}>
            <div className={styles.container}>
              <div className={styles.spinnerWrapper}>
                <img src={require('../../../../Imagens/spinner.gif')} />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      //  let elemento;
      // if (this.state.image == "") {
      //   elemento = "";
      // } else {

      //elemento = <img className={styles.imagem} src={this.state.image} alt="Visualização não suportada" />
      //  elemento = <object data={this.state.image} width="120%" height="100%" />
      //   }
      let renderizar: boolean = false;
      if (this.state.arquivo) {
        let nameArray : Array<string> = this.state.arquivo.name.split(".");

        if (nameArray[nameArray.length-1].match(/xml|jpg|pdf|png|bmp|jpeg|txt/gi)){
          renderizar = true;
        }
      }

      return (
        <div className={styles.uploadDeDocumentos} >
          <div className={styles.container}>
            <div className={styles.row}>
              <div className={styles.containerUpload}>
                <div className={styles.containerForm}>
                  <h4><span>Selecione o arquivo para upload</span></h4>
                  <input onChange={(e) => this.handleChange(e.target.files)} type="file"></input>
                  <p></p>
                  <div className={styles.uploadButtons}>
                    <button type="button" onClick={() => this.enviar()}>Enviar</button>
                    <button type="button" onClick={() => this.props.handler("lista")}>Voltar para lista</button>
                  </div>
                </div>
                <div className={styles.frame}>
                  {
                    renderizar ? <Iframe className={styles.iFrame} url="" src={this.state.image} width="119%" height="100%" allowFullScreen /> : ""
                  }

                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}
