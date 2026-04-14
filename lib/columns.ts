export type ColDef = {
  key: string;
  label: string;
  width: number;
  type: "text" | "number" | "select" | "action" | "readonly";
  cad?: string;
};

const COLUMNS: ColDef[] = [
  { key: "ref",            label: "Referência",        width: 120, type: "text" },
  { key: "desc",           label: "Descrição",         width: 260, type: "text" },
  { key: "tecido",         label: "Tecido",            width: 200, type: "select", cad: "tecido" },
  { key: "forn_tecido",    label: "Forn. tecido",      width: 140, type: "readonly" },
  { key: "status",         label: "Status atual",      width: 180, type: "select", cad: "status" },
  { key: "piloto_most",    label: "Piloto / mostr.",   width: 160, type: "select", cad: "piloto_most" },
  { key: "colecao",        label: "Coleção",           width: 120, type: "select", cad: "colecao" },
  { key: "link_ficha",     label: "Ficha",             width: 70,  type: "action" },
  { key: "grupo",          label: "Grupo",             width: 120, type: "select", cad: "grupo" },
  { key: "subgrupo",       label: "Subgrupo",          width: 200, type: "select", cad: "subgrupo" },
  { key: "operacao",       label: "Operação",          width: 170, type: "select", cad: "operacao" },
  { key: "fornecedor",     label: "Fornecedor",        width: 140, type: "select", cad: "fornecedor" },
  { key: "grade",          label: "Grade",             width: 90,  type: "select", cad: "grade" },
  { key: "categoria",      label: "Categoria",         width: 130, type: "select", cad: "categoria" },
  { key: "subcategoria",   label: "Subcategoria",      width: 130, type: "select", cad: "subcategoria" },
  { key: "tab_medidas",    label: "Tab. medidas",      width: 200, type: "select", cad: "tab_medidas" },
  { key: "tipo",           label: "Tipo",              width: 130, type: "select", cad: "tipo" },
  { key: "linha",          label: "Linha",             width: 100, type: "select", cad: "linha" },
  { key: "drop",           label: "Drop",              width: 65,  type: "select", cad: "drop" },
  { key: "estilista",      label: "Estilista",         width: 110, type: "select", cad: "estilista" },
];

export default COLUMNS;
