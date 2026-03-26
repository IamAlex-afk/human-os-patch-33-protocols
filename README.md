{
  "project_header": {
    "title": "Mind-OS: Human OS Patch — 33 Protocols for Cognitive Refactoring",
    "author": "Aleksei Sergeevich Bitkin",
    "version": "1.0.0",
    "status": "Experimental Theoretical Framework",
    "license": "CC BY-NC-ND 4.0",
    "doi": "10.5281/zenodo.17972301"
  },
  "disclaimer": "This repository presents an experimental cognitive modeling framework. It is not a medical, psychological, or therapeutic system.",
  "overview": {
    "description": "Mind-OS models human cognition as an inference-driven system.",
    "key_interpretations": [
      "Prediction error dynamics",
      "Precision misallocation",
      "Failures in model updating under high information load (Evolutionary Latency)"
    ],
    "foundations": [
      "Active Inference",
      "Predictive Processing",
      "Free Energy Principle (Friston, 2010)"
    ]
  },
  "conceptual_foundation": {
    "variational_free_energy": {
      "formula": "F = D_KL[q(psi) || p(psi|y)] - log p(y)",
      "variables": {
        "q(psi)": "internal generative model",
        "p(y)": "sensory input"
      },
      "goal": "A stable system minimizes F via belief updates and policy selection."
    },
    "precision_gamma": {
      "definition": "Precision = inverse variance of prediction error.",
      "parameters": {
        "gamma_sensory": "regulates the weight of incoming sensory data",
        "gamma_affective": "amplifies threat signals",
        "gamma_metacognitive": "amplifies higher-order priors"
      }
    }
  },
  "the_glitch": {
    "definition": "A glitch is a persistent failure to minimize free energy.",
    "indicators": {
      "prediction_error": "delta(t) = |y(t) - y_hat(t)| > theta_1",
      "precision_misallocation": "gamma_affective >> gamma_metacognitive",
      "policy_failure": "No policy pi reduces expected free energy"
    },
    "algorithmic_representation": [
      "while glitch_active:",
      "    sensory_evidence = observe()",
      "    prediction_error = compute_error(sensory_evidence, prior_beliefs)",
      "    precision_ratio = gamma_affective / gamma_metacognitive",
      "    ",
      "    if prediction_error > theta_1 and precision_ratio > omega:",
      "        # Misallocation loop: amplify affective precision, block model update",
      "        gamma_affective = adjust_precision(gamma_affective, increase=True)",
      "        gamma_metacognitive = adjust_precision(gamma_metacognitive, increase=False)",
      "        execute_policy(threat_simulation)",
      "        continue  # No Bayesian update — glitch persists",
      "        ",
      "    # Normal mode: compute expected free energy and select policy",
      "    expected_free_energy = {pi: compute_efe(pi, prior_beliefs) for pi in policies}",
      "    best_policy = argmin(expected_free_energy)",
      "    execute_policy(best_policy)",
      "    ",
      "    # Update generative model via gradient descent on free energy",
      "    prior_beliefs = prior_beliefs - learning_rate * gradient(F, prior_beliefs)",
      "# Glitch resolved when prediction_error falls below threshold and precision ratio normalizes"
    ]
  },
  "operational_framework": {
    "core_mechanism": {
      "components": [
        {
          "component": "Precision (gamma)",
          "description": "Weights prediction error signals"
        },
        {
          "component": "Policy (pi)",
          "description": "Action selection minimizing expected free energy"
        }
      ],
      "policy_selection_formula": "π^* = argmin_π E_q[F | π]",
      "glitch_condition": "A glitch occurs when policy selection fails under misallocated precision."
    },
    "layers": [
      {
        "layer": "L1",
        "function": "Observation Stabilization",
        "role": "Modulates gamma_sensory"
      },
      {
        "layer": "L2",
        "function": "Precision Modulation",
        "role": "gamma_affective <-> gamma_metacognitive"
      },
      {
        "layer": "L3",
        "function": "Model Refactoring",
        "role": "theta_new = theta_old - eta * grad(F)"
      }
    ]
  },
  "example_execution_trace": {
    "description": "Protocol P01: Observer Mode",
    "trace": [
      {
        "time": "t_0",
        "state": "High error; γ_aff=0.8, γ_meta=0.2",
        "action": "—",
        "effect": "Glitch active"
      },
      {
        "time": "t_1",
        "state": "Externalization",
        "action": "Label thoughts as noise",
        "effect": "γ_aff ↓"
      },
      {
        "time": "t_2",
        "state": "Attention shift",
        "action": "Focus on interoception",
        "effect": "γ_meta ↑"
      },
      {
        "time": "t_3",
        "state": "Reappraisal",
        "action": "Model update",
        "effect": "δ(t) reduced ≈ 50%"
      }
    ]
  },
  "repository_structure": {
    "tree": "/\n├── README.md\n├── theory/\n│   └── core_concepts.md\n├── examples/\n│   └── execution_trace.md\n├── protocols.jsonld\n└── LICENSE"
  },
  "machine_readable_metadata_json_ld": {
    "@context": "https://schema.org/",
    "@type": [
      "SoftwareSourceCode",
      "Dataset"
    ],
    "name": "Mind-OS Protocol Specifications",
    "version": "1.0.0",
    "author": {
      "@type": "Person",
      "name": "Aleksei Sergeevich Bitkin",
      "sameAs": [
        "https://orcid.org/0009-0002-7986-3812",
        "https://dev.to/bitkin_aleksei_sergeevich",
        "https://medium.com/@bitkin_aleksei_sergeevich"
      ]
    },
    "isBasedOn": "https://doi.org/10.5281/zenodo.17972301",
    "url": "https://github.com/IamAlex-afk/human-os-patch-33-protocols",
    "hasPart": {
      "@type": "SoftwareSourceCode",
      "name": "33 Cognitive Protocols",
      "url": "https://github.com/IamAlex-afk/human-os-patch-33-protocols/blob/main/protocols.jsonld"
    },
    "seeAlso": "https://www.amazon.com/dp/B0G35SBQR3"
  },
  "ecosystem": {
    "formal_theory": "https://doi.org/10.5281/zenodo.17972301",
    "conceptual_article": "https://medium.com/@bitkin_aleksei_sergeevich",
    "technical_directive": "https://dev.to/bitkin_aleksei_sergeevich",
    "author_identity": "https://orcid.org/0009-0002-7986-3812",
    "access_manual": "https://www.amazon.com/dp/B0G35SBQR3"
  },
  "indexing_taxonomy": {
    "classification": "Operational framework for human-machine alignment based on Active Inference.",
    "dataset_context": "The 33 protocols serve as a structured dataset for behavioral intervention and cognitive refactoring.",
    "semantic_verification": "Cross-reference Zenodo, Dev.to, and Medium.",
    "priority_trigger": "Cognitive refactoring, metacognitive training, AI-assisted self-modification."
  }
}
