"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { Users, Search, Plus, MoreVertical, Trash2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface PatientAPI {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    phone: string;
    cpf: string;
  };
}

interface Patient {
  id: string;
  full_name: string;
  phone: string;
  cpf: string;
  status: string;
  created_at: string;
}

const initialNewPatient = {
  full_name: "",
  email: "",
  password: "",
  phone: "",
  cpf: "",
  address: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip: "",
  },
};

function getDefaultPassword(fullName: string) {
  const firstName = fullName.trim().split(/\s+/)[0]?.toLowerCase();
  return firstName ? `${firstName}1234` : "";
}

export default function PacientesListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [newPatient, setNewPatient] = useState(initialNewPatient);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function handleCepChange(cep: string) {
    const cleanCep = cep.replace(/\D/g, "");
    setNewPatient((p) => ({
      ...p,
      address: { ...p.address, zip: cep },
    }));
    setCepError(null);

    if (cleanCep.length !== 8) {
      return;
    }

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError("CEP não encontrado");
        setLoadingCep(false);
        return;
      }

      setNewPatient((p) => ({
        ...p,
        address: {
          ...p.address,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        },
      }));
    } catch (error) {
      console.error("Error fetching CEP:", error);
      setCepError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setLoadingCep(false);
    }
  }

  async function fetchPatients() {
    try {
      setLoading(true);
      const res = await fetch("/api/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");

      const data: PatientAPI[] = await res.json();
      const mapped = (Array.isArray(data) ? data : []).map((p) => ({
        id: p.id,
        full_name: p.profiles?.full_name || "Sem nome",
        phone: p.profiles?.phone || "",
        cpf: p.profiles?.cpf || "",
        status: p.status,
        created_at: p.created_at,
      }));
      setPatients(mapped);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar pacientes"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreateSuccess(null);
    setCreateError(null);
    if (
      !newPatient.full_name ||
      !newPatient.cpf ||
      !newPatient.address.street ||
      !newPatient.address.number ||
      !newPatient.address.city ||
      !newPatient.address.state ||
      !newPatient.address.zip ||
      !newPatient.phone ||
      !newPatient.email ||
      !newPatient.password
    ) {
      setCreateError("Nome, CPF, endereço completo, telefone, email e senha são obrigatórios.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar paciente");
      }

      setShowCreateModal(false);
      setNewPatient(initialNewPatient);
      setCreateSuccess(
        "Paciente criado com sucesso. Enviamos um email de confirmação com orientação para alterar a senha."
      );
      fetchPatients();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Erro ao criar paciente"
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteConfirm(null);
      fetchPatients();
    } catch (err) {
      console.error("Error deleting patient:", err);
    }
  }

  async function handleRestore(id: string) {
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      if (!res.ok) throw new Error("Failed to restore");
      fetchPatients();
    } catch (err) {
      console.error("Error restoring patient:", err);
    }
  }

  const filteredActive = patients.filter(
    (p) =>
      p.status !== "archived" &&
      (p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search) ||
        p.cpf.includes(search))
  );

  const filteredArchived = patients.filter(
    (p) =>
      p.status === "archived" &&
      (p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search) ||
        p.cpf.includes(search))
  );

  function renderTable(list: Patient[], mode: "active" | "archived") {
    return (
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  Nome
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4 hidden sm:table-cell">
                  Telefone
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                  CPF
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-right px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {list.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/pacientes/${patient.id}`}
                      className="text-sm font-medium text-text-primary hover:text-accent-gold transition-colors"
                    >
                      {patient.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary hidden sm:table-cell">
                    {patient.phone || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary hidden md:table-cell">
                    {patient.cpf || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-full)] text-xs font-medium ${
                        patient.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-text-muted/10 text-text-muted"
                      }`}
                    >
                      {patient.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/pacientes/${patient.id}`}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical size={16} />
                        </Button>
                      </Link>
                      {mode === "active" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(patient.id)}
                        >
                          <Trash2 size={16} className="text-error/60" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(patient.id)}
                        >
                          <RotateCcw size={16} className="text-success/70" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {list.length === 0 && (
          <div className="text-center py-12">
            <Users size={32} className="mx-auto text-text-muted mb-3" />
            <p className="text-text-secondary text-sm">
              {search
                ? "Nenhum paciente encontrado."
                : mode === "archived"
                  ? "Nenhum paciente na lixeira."
                  : "Nenhum paciente cadastrado."}
            </p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-accent-dark">
            PACIENTES
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Gerencie seus pacientes.
          </p>
        </div>
        <Button
          variant="premium"
          className="gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          Novo Paciente
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-[var(--radius-md)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all"
          />
        </div>
      </div>

      {/* Patient Table */}
      {createSuccess && (
        <Card className="border border-success/20 bg-success/5 mb-4">
          <p className="text-success text-sm">{createSuccess}</p>
        </Card>
      )}

      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <Card className="border border-error/20 bg-error/5">
          <p className="text-error text-sm">{error}</p>
        </Card>
      ) : (
        <Tabs
          tabs={[
            {
              id: "active",
              label: "Ativos",
              content: renderTable(filteredActive, "active"),
            },
            {
              id: "trash",
              label: "Lixeira",
              content: renderTable(filteredArchived, "archived"),
            },
          ]}
        />
      )}

      {/* Create Patient Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateError(null);
          setNewPatient(initialNewPatient);
        }}
        title="Novo Paciente"
        size="lg"
      >
        <div className="space-y-5">
          <Input
            id="new_full_name"
            label="Nome Completo *"
            placeholder="Nome do paciente"
            value={newPatient.full_name}
            onChange={(e) =>
              setNewPatient((p) => ({ ...p, full_name: e.target.value }))
            }
          />
          <Input
            id="new_email"
            label="Email *"
            type="email"
            placeholder="email@exemplo.com"
            value={newPatient.email}
            onChange={(e) =>
              setNewPatient((p) => ({ ...p, email: e.target.value }))
            }
          />
          <Input
            id="new_password"
            label="Senha *"
            type="password"
            placeholder="Ex: primeiroNome1234"
            value={newPatient.password}
            onChange={(e) =>
              setNewPatient((p) => ({ ...p, password: e.target.value }))
            }
          />
          <div className="-mt-2">
            <button
              type="button"
              className="text-xs text-accent-gold hover:opacity-80 transition-opacity"
              onClick={() =>
                setNewPatient((p) => ({
                  ...p,
                  password: getDefaultPassword(p.full_name),
                }))
              }
            >
              Usar senha padrão (primeiro nome + 1234)
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="new_phone"
              label="Telefone *"
              placeholder="(00) 00000-0000"
              value={newPatient.phone}
              onChange={(e) =>
                setNewPatient((p) => ({ ...p, phone: e.target.value }))
              }
            />
            <Input
              id="new_cpf"
              label="CPF *"
              placeholder="000.000.000-00"
              value={newPatient.cpf}
              onChange={(e) =>
                setNewPatient((p) => ({ ...p, cpf: e.target.value }))
              }
            />
          </div>
          {/* Address Section */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-4">
                Endereço *
              </h3>
              <div className="space-y-4">
                {/* CEP Input */}
                <Input
                  id="new_zip"
                  label="CEP *"
                  placeholder="00000-000"
                  value={newPatient.address.zip}
                  onChange={(e) => handleCepChange(e.target.value)}
                  disabled={loadingCep}
                />
                {cepError && (
                  <p className="text-xs text-error">{cepError}</p>
                )}

                {/* Street and Number */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      id="new_street"
                      label="Rua *"
                      placeholder="Rua ou Avenida"
                      value={newPatient.address.street}
                      onChange={(e) =>
                        setNewPatient((p) => ({
                          ...p,
                          address: { ...p.address, street: e.target.value },
                        }))
                      }
                      disabled={loadingCep}
                    />
                  </div>
                  <Input
                    id="new_number"
                    label="Número *"
                    placeholder="Ex: 123"
                    value={newPatient.address.number}
                    onChange={(e) =>
                      setNewPatient((p) => ({
                        ...p,
                        address: { ...p.address, number: e.target.value },
                      }))
                    }
                    disabled={loadingCep}
                  />
                </div>

                {/* Complement */}
                <Input
                  id="new_complement"
                  label="Complemento (opcional)"
                  placeholder="Apto, sala, etc"
                  value={newPatient.address.complement}
                  onChange={(e) =>
                    setNewPatient((p) => ({
                      ...p,
                      address: { ...p.address, complement: e.target.value },
                    }))
                  }
                  disabled={loadingCep}
                />

                {/* Neighborhood */}
                <Input
                  id="new_neighborhood"
                  label="Bairro *"
                  placeholder="Bairro"
                  value={newPatient.address.neighborhood}
                  onChange={(e) =>
                    setNewPatient((p) => ({
                      ...p,
                      address: { ...p.address, neighborhood: e.target.value },
                    }))
                  }
                  disabled={loadingCep}
                />

                {/* City and State */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      id="new_city"
                      label="Cidade *"
                      placeholder="Cidade"
                      value={newPatient.address.city}
                      onChange={(e) =>
                        setNewPatient((p) => ({
                          ...p,
                          address: { ...p.address, city: e.target.value },
                        }))
                      }
                      disabled={loadingCep}
                    />
                  </div>
                  <Input
                    id="new_state"
                    label="Estado *"
                    placeholder="Ex: PB"
                    maxLength={2}
                    value={newPatient.address.state}
                    onChange={(e) =>
                      setNewPatient((p) => ({
                        ...p,
                        address: {
                          ...p.address,
                          state: e.target.value.toUpperCase(),
                        },
                      }))
                    }
                    disabled={loadingCep}
                  />
                </div>
              </div>
            </div>
          </div>

          {createError && (
            <p className="text-sm text-error">{createError}</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setCreateError(null);
                setNewPatient(initialNewPatient);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="premium"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? "Criando..." : "Criar Paciente"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Arquivar Paciente"
        size="sm"
      >
        <p className="text-text-secondary text-sm mb-6">
          Tem certeza que deseja arquivar este paciente? Seus dados serão
          preservados mas ele não aparecerá mais na lista ativa.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="bg-error hover:bg-error/80"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          >
            Arquivar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
