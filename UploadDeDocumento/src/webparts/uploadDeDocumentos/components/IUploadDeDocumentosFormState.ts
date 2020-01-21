import Documento from '../../../Models/documento';

export interface IUploadDeDocumentosFormState {
    arquivo: File;
    mensagemDeErro : string;
    carregandoArquivo : boolean;
    image : string;
  }
  