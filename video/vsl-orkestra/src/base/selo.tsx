import { COR, FONTE } from './marca';

/** As telas do produto são desenhos com dados fictícios: sempre identificadas. */
export const SeloExemplo: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 48,
      right: 64,
      padding: '8px 18px',
      borderRadius: 999,
      border: `1px solid ${COR.borda}`,
      color: COR.suave,
      fontFamily: FONTE,
      fontWeight: 600,
      fontSize: 24,
    }}
  >
    Exemplo ilustrativo · dados fictícios
  </div>
);
