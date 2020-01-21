import Documento from '../../../Models/documento';

export interface IListagemDeDocumentoState {
    documentos : Documento[];
    mensagemDeErro : string;
    ultimoOrdenado : string;

  }
  