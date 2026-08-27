"""
UNIVERSIDADE UNIFECAF
DISCIPLINA: Algoritmos e Lógica de Programação
DESAFIO: Gestão de Peças, Qualidade e Armazenamento
"""

import math
CAPACIDADE_CAIXA = 10


def inspecionar_peca(peso, cor, comprimento):

    motivos = []
    cor_normalizada = cor.strip().lower()

    if not (95 <= peso <= 105):
        motivos.append(f"Peso fora do padrão ({peso:g}g)")

    if cor_normalizada not in ["azul", "verde"]:
        motivos.append(f"Cor inválida ('{cor}')")

    if not (10 <= comprimento <= 20):
        motivos.append(f"Comprimento fora do padrão ({comprimento:g}cm)")

    return {
        "status": "APROVADA" if len(motivos) == 0 else "REPROVADA",
        "motivos": motivos,
    }


def calcular_caixas(pecas):
    aprovadas = [p for p in pecas if p["status"] == "APROVADA"]
    caixas = []

    for index in range(0, len(aprovadas), CAPACIDADE_CAIXA):
        lote = aprovadas[index:index + CAPACIDADE_CAIXA]
        caixas.append({
            "numero": len(caixas) + 1,
            "pecas": lote,
            "status": "FECHADA" if len(lote) == CAPACIDADE_CAIXA else "ABERTA",
        })

    return caixas


def ler_float_positivo(rotulo):
    while True:
        try:
            valor = float(input(rotulo).replace(",", "."))
            if valor > 0:
                return valor
            print("Entrada inválida! Digite um valor numérico positivo.")
        except ValueError:
            print("Entrada inválida! Digite um número válido.")


def cadastrar_peca(pecas):
  
    print("\n--- CADASTRO DE PEÇA ---")
    while True:
        id_peca = input("ID da Peça: ").strip()
        if not id_peca:
            print("O ID da peça não pode ser vazio.")
            continue
        if any(p["id"].lower() == id_peca.lower() for p in pecas):
            print(f"Erro: Já existe uma peça com o ID '{id_peca}'. Use outro ID.")
            continue
        break

    peso = ler_float_positivo("Peso (g): ")
    cor = input("Cor (azul/verde): ").strip()
    comprimento = ler_float_positivo("Comprimento (cm): ")

    inspecao = inspecionar_peca(peso, cor, comprimento)
    dados_peca = {
        "id": id_peca,
        "peso": peso,
        "cor": cor,
        "comprimento": comprimento,
        "status": inspecao["status"],
        "motivos": inspecao["motivos"],
    }

    pecas.append(dados_peca)

    if dados_peca["status"] == "APROVADA":
        print(f"-> SUCESSO: Peça '{id_peca}' APROVADA e enviada para loteamento!")
    else:
        print(f"-> ATENÇÃO: Peça '{id_peca}' REPROVADA. Motivo(s): {'; '.join(dados_peca['motivos'])}")


def listar_pecas(pecas):

    if not pecas:
        print("\nNenhuma peça cadastrada no sistema.")
        return

    print("\n=================== LISTAGEM DE PEÇAS ===================")
    for p in pecas:
        motivos_str = "; ".join(p["motivos"]) if p["motivos"] else "Nenhum (Aprovada)"
        print(
            f"ID: {p['id']:<8} | Peso: {p['peso']:g}g | Cor: {p['cor']:<6} | "
            f"Comp: {p['comprimento']:g}cm | Status: {p['status']:<9} | Motivos: {motivos_str}"
        )
    print("==========================================================")


def remover_peca(pecas):

    print("\n--- REMOVER PEÇA ---")
    id_remover = input("Informe o ID da peça a ser removida: ").strip()
    total_antes = len(pecas)

    pecas[:] = [p for p in pecas if p["id"].lower() != id_remover.lower()]

    if len(pecas) < total_antes:
        print(f"-> Peça '{id_remover}' removida com sucesso. Caixas e relatórios recalculados.")
    else:
        print(f"-> Erro: Nenhuma peça encontrada com o ID '{id_remover}'.")


def listar_caixas(pecas):

    caixas = calcular_caixas(pecas)

    if not caixas:
        print("\nNenhuma caixa iniciada (Peças reprovadas não ocupam espaço).")
        return

    print("\n=================== CONTROLE DE CAIXAS ===================")
    for c in caixas:
        ids_pecas = ", ".join(p["id"] for p in c["pecas"])
        print(
            f"Caixa {c['numero']:02d} | Status: {c['status']:<7} | "
            f"Ocupação: {len(c['pecas'])}/{CAPACIDADE_CAIXA} peças | IDs: [{ids_pecas}]"
        )
    print("==========================================================")


def gerar_relatorio(pecas):

    aprovadas = [p for p in pecas if p["status"] == "APROVADA"]
    reprovadas = [p for p in pecas if p["status"] == "REPROVADA"]
    caixas = calcular_caixas(pecas)

    print("\n==========================================================")
    print("                 RELATÓRIO CONSOLIDADO DE QA              ")
    print("==========================================================")
    print(f"Total de peças aprovadas  : {len(aprovadas)}")
    print(f"Total de peças reprovadas : {len(reprovadas)}")
    print(f"Total de caixas utilizadas: {len(caixas)}")
    print(f"Total de peças cadastradas: {len(pecas)}")

    if reprovadas:
        print("\nDetalhamento dos Motivos de Reprovação:")
        for p in reprovadas:
            print(f"  • Peça ID '{p['id']}': {'; '.join(p['motivos'])}")
    else:
        print("\nNenhuma reprovação registrada até o momento.")
    print("==========================================================")


def main():
    pecas = []

    while True:
        print("\n=== AUTOINSPECT - SISTEMA DE INSPEÇÃO ===")
        print("1. Cadastrar nova peça")
        print("2. Listar peças aprovadas/reprovadas")
        print("3. Remover peça cadastrada")
        print("4. Listar caixas fechadas / status")
        print("5. Gerar relatório final")
        print("0. Sair do programa")

        opcao = input("Selecione uma opção (0-5): ").strip()

        if opcao == "1":
            cadastrar_peca(pecas)
        elif opcao == "2":
            listar_pecas(pecas)
        elif opcao == "3":
            remover_peca(pecas)
        elif opcao == "4":
            listar_caixas(pecas)
        elif opcao == "5":
            gerar_relatorio(pecas)
        elif opcao == "0":
            print("Encerrando o sistema...")
            break
        else:
            print("Opção inválida. Escolha um número entre 0 e 5.")


if __name__ == "__main__":
    main()