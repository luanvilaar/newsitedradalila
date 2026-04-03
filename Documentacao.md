Server URL: 
https://free.uazapi.com

Instance Token:  
d1579b23-613d-4c6a-806e-5f66440f89f6

uazapiGO - WhatsApp API
v2.0.1
API para gerenciamento de instâncias do WhatsApp e comunicações.

⚠️ Recomendação Importante: WhatsApp Business
É ALTAMENTE RECOMENDADO usar contas do WhatsApp Business em vez do WhatsApp normal para integração, o WhatsApp normal pode apresentar inconsistências, desconexões, limitações e instabilidades durante o uso com a nossa API.

Autenticação
Endpoints regulares requerem um header 'token' com o token da instância
Endpoints administrativos requerem um header 'admintoken'
Estados da Instância
As instâncias podem estar nos seguintes estados:

disconnected: Desconectado do WhatsApp
connecting: Em processo de conexão
connected: Conectado e autenticado com sucesso
Limites de Uso
O servidor possui um limite máximo de instâncias conectadas
Quando o limite é atingido, novas tentativas receberão erro 429
Servidores gratuitos/demo podem ter restrições adicionais de tempo de vida
136
Endpoints
15
Schemas
2
Security
1
Servers
Baixar Especificação OpenAPI
Baixe a especificação OpenAPI completa com todas as referências resolvidas e pronta para uso.

Baixar Especificação
API Servers
https://{subdomain}.uazapi.com
Servidor da API uazapiGO