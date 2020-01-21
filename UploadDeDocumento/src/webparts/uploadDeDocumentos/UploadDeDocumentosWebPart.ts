import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, SPEvent } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

import * as strings from 'UploadDeDocumentosWebPartStrings';
import UploadDeDocumentos from './components/UploadDeDocumentos';
import { IUploadDeDocumentosProps } from './components/IUploadDeDocumentosProps';

export default class UploadDeDocumentosWebPart extends BaseClientSideWebPart<IUploadDeDocumentosProps> {

  public render(): void {
    const element: React.ReactElement<IUploadDeDocumentosProps> = React.createElement(
      UploadDeDocumentos,
      {
        siteUrl: this.context.pageContext.web.absoluteUrl,
        idUsuario: this.context.pageContext.user.email,
        listaDeDocumentos : this.properties.listaDeDocumentos,
        bibliotecaDeDocumento: this.properties.bibliotecaDeDocumento,
        colunaUsuario: this.properties.colunaUsuario,
        colunaDocumento: this.properties.colunaDocumento
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                // PropertyPaneTextField('description', {
                //   label: strings.DescriptionFieldLabel
                // }),
                PropertyPaneTextField('listaDeDocumentos', {
                  label: "Nome da lista de documentos"
                }),
                PropertyPaneTextField('bibliotecaDeDocumento', {
                  label: "Nome da biblioteca de documentos"
                }),
                PropertyPaneTextField('colunaUsuario', {
                  label: "Nome da coluna de usuários (Pessoa)"
                }),
                PropertyPaneTextField('colunaDocumento', {
                  label: "Nome da coluna do tipo documentos (Consulta)"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
