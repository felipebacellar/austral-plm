export type ColDef = {
  key: string;
  label: string;
  width: number;
  type: "text" | "number" | "select" | "action";
  cad?: string;   // which cadastro table to use for dropdown
};

const COLUMNS: ColDef[] = [
  { key: "ref",           label: "Referência",   width: 108, type: "text" },
  { key: "desc",          label: "Descrição",    width: 195, type: "text" },
  { key: "grupo",         label: "Grupo",        width: 100, type: "select", cad: "grupo" },
  { key: "subgrupo",      label: "Subgrupo",     width: 140, type: "select", cad: "subgrupo" },
  { key: "cor",           label: "Cor",          width: 150, type: "select", cad: "cor" },
  { key: "tecido",        label: "Tecido",       width: 145, type: "select", cad: "tecido" },
  { key: "fornecedor",    label: "Fornecedor",   width: 110, type: "select", cad: "fornecedor" },
  { key: "operacao",      label: "Operação",     width: 125, type: "select", cad: "operacao" },
  { key: "categoria",     label: "Categoria",    width: 100, type: "select", cad: "categoria" },
  { key: "subcategoria",  label: "Subcateg.",    width: 100, type: "select", cad: "subcategoria" },
  { key: "colecao",       label: "Coleção",      width: 95,  type: "select", cad: "colecao" },
  { key: "linha",         label: "Linha",        width: 85,  type: "select", cad: "linha" },
  { key: "grade",         label: "Grade",        width: 75,  type: "select", cad: "grade" },
  { key: "tipo",          label: "Tipo",         width: 92,  type: "select", cad: "tipo" },
  { key: "lavagem",       label: "Lavagem",      width: 92,  type: "text" },
  { key: "drop",          label: "Drop",         width: 55,  type: "select", cad: "drop" },
  { key: "status",        label: "Status",       width: 148, type: "select", cad: "status" },
  { key: "estilista",     label: "Estilista",    width: 85,  type: "text" },
  { key: "custo_forn",    label: "Custo forn.",  width: 85,  type: "number" },
  { key: "custo_total",   label: "Custo total",  width: 85,  type: "number" },
  { key: "mkp",           label: "MKP 5,5",      width: 85,  type: "number" },
  { key: "_ficha",        label: "Ficha",        width: 52,  type: "action" },
];

export default COLUMNS;
