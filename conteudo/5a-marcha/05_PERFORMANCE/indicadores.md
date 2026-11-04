# Indicadores e rotina de análise

Arquivos desta pasta:
- `painel.csv`: uma linha por publicação e por janela (72h, 7d e 30d), com a data de coleta já calculada. As versões de teste (Trial Reels e capas B) têm linhas próprias.
- `testes_ab.csv`: os 5 testes do ciclo, com o que muda, o que medir e como decidir.

Para usar como planilha: importe o `painel.csv` no Google Sheets (Arquivo > Importar) e preencha os números na data de coleta. As colunas de taxa ficam em branco no CSV; crie as fórmulas abaixo na planilha.

## Fórmulas (sempre com o mesmo denominador)

Toda taxa usa o **alcance** (contas alcançadas) como base, para comparar vídeos com tamanhos diferentes. Nunca misture alcance com visualizações no mesmo indicador.

| Indicador | Fórmula | Para que serve |
|---|---|---|
| Envios por alcance | envios / alcance x 100 | Sinal mais ligado a alcance novo, segundo o Mosseri (F02) |
| Salvamentos por alcance | salvamentos / alcance x 100 | Valor de consulta. Principal métrica de carrossel e de ensino prático |
| Curtidas por alcance | curtidas / alcance x 100 | Sinal citado pelo Mosseri; usar como apoio |
| Seguidores por alcance | novos seguidores / alcance x 100 | Conversão em audiência |
| Retenção relativa | tempo médio assistido / duração x 100 | Compara vídeos de durações diferentes |
| Taxa acima de 3 s | dado do Instagram (view rate) | Força do gancho (F03) |
| Alcance de não seguidores | dado do Instagram, em % do alcance | Quanto o conteúdo saiu da bolha |
| Comentários qualificados | comentários de vendedores com dúvida, experiência ou resposta ao desafio | Qualidade comercial. Não contar emoji e "top" |
| DMs qualificadas | mensagens que pedem método, material, mentoria ou formação | Demanda para a 5ª Marcha |

Ponto de queda: abra o gráfico de retenção do Reel (F04) e anote em que segundo a curva cai mais. Compare com o bloco do roteiro naquele tempo.

## Rotina de análise

**72 horas:** primeira leitura. Preencha alcance, taxa acima de 3 s, tempo médio, envios e salvamentos. Não tome decisão de série com 72 h, só anote o ponto de queda.

**7 dias:** leitura principal. É a janela usada nos testes (T1 a T5). Compare o Reel com a mediana dos últimos 10 do mesmo formato.

**30 dias:** leitura de longo prazo. Carrosséis e ensino prático costumam continuar recebendo salvamentos depois da primeira semana. Preencha a coluna `decisao`.

**Toda sexta (15 minutos, junto com a revisão do R066):**
1. Preencher as janelas que venceram na semana.
2. Separar os 3 conteúdos com mais envios por alcance e os 3 com mais salvamentos por alcance dos últimos 30 dias.
3. Anotar uma decisão: repetir tema, trocar abertura, encurtar, melhorar exemplo ou encerrar série.

**Primeira revisão grande (depois de 10 publicações, em 13/11/2026):** seguir o critério do Lote 01. A decisão sobre os próximos conteúdos vem desse aprendizado, não do número de visualizações.

**Revisão de ciclo (D90, 01/02/2027):** resultado dos 5 testes, ranking por série e por formato, e o plano do ciclo seguinte.

## Valores da coluna `decisao`

`repetir tema` · `trocar gancho` · `encurtar` · `melhorar exemplo` · `virar série` · `encerrar série` · `virar carrossel` · `sem decisão (amostra pequena)`

## Valores da coluna `familia_gancho`

Use as famílias da `06_PRODUCAO/biblioteca-de-ganchos.md`: identificação, contraste, paradoxo, erro específico, frase do cliente, troca de frase, promessa aplicável, desafio, opinião provocativa, autoridade contextual, demonstração, número de passos.

## Cuidados

- Amostra pequena engana. Com menos de 5 conteúdos por grupo, trate o resultado como sinal.
- Viralizar não é sucesso comercial. Um Reel com poucas visualizações e muitas DMs qualificadas pode valer mais que um com muitas visualizações e nenhuma conversa.
- Feriados e datas comemorativas (marcados no calendário) ficam fora das comparações.
- A meta de 100 mil seguidores qualificados é direção, não promessa. O painel mede se estamos indo para lá.
