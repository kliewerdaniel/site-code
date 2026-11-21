---
author: Daniel Kliewer
canonical_url: /blog/2026-11-20-calibrating-a-terminal-bench-task-agents-could-not-just-read
date: 11-20-2026
description: "A reproducible account of turning a Terminal-Bench 3 task that agents solved three out of three times into a black-box behavioural reconstruction task that passed difficulty, solvability, fairness, anti-cheat and verifier-audit gates. Every command, contract, gate finding and fix is included."
image: /images/2026-11-20-tb3-green-gates.png
layout: post
title: "Calibrating a Terminal-Bench Task Until Agents Could Not Just Read the Answer"
og:description: "A reproducible account of turning a Terminal-Bench 3 task that agents solved three out of three times into a black-box behavioural reconstruction task that passed difficulty, solvability, fairness, anti-cheat and verifier-audit gates."
og:image: /images/2026-11-20-tb3-green-gates.png
og:title: "Calibrating a Terminal-Bench Task Until Agents Could Not Just Read the Answer"
og:type: article
og:url: /blog/2026-11-20-calibrating-a-terminal-bench-task-agents-could-not-just-read
tags:
  - benchmarks
  - agent-evaluation
  - terminal-bench
  - reproducibility
  - black-box
  - verification
twitter:card: summary_large_image
twitter:description: "How a 3/3-solved benchmark task became a probeable black-box reconstruction task, with every command and gate finding included."
twitter:image: /images/2026-11-20-tb3-green-gates.png
twitter:title: "Calibrating a Terminal-Bench Task Until Agents Could Not Just Read the Answer"
---

# Calibrating a Terminal-Bench Task Until Agents Could Not Just Read the Answer

A benchmark measures the shortcut you left in the room.

I say that because we watched three agents independently find the same shortcut, seven times. Every scored round came back `3 valid trial(s), 3 solved`. The task was well written, the tests were real, and the agents were doing exactly what the specification told them: read the contract, implement the contract, pass the tests.

The problem was the contract. It named the mechanism — signed tokens, persistent revocation, rotated-token invalidation — and the repository shipped a reference implementation alongside it. That is not a difficult task. That is a transcription exercise with a security vocabulary.

This post is the full account of how that task was rebuilt into a black-box behavioural reconstruction problem, how it was validated locally, and how every review gate was closed. Every number below was measured. The final run had **21 successful checks** and **12 intentionally skipped checks**; PR #1 is open and mergeable at commit `ddb568c`.

> **Editor's note.** This is a point-in-time record of the Conductor/TB3 review pipeline as it behaved on 2026-11-20/21. No credentials are reproduced. Where a private index or access token appears in logs, it is described by name only.

---

## 1. What we were actually building

The repository was `full-stack-engineering-legacy-web-modernization-3460bd69-c486a51e5d81`, assigned persona **P02** and workstream **W3 · Legacy Web Modernization**. The deliverable was one task under `tasks/`. The accepted task slug is `signed-session-retrofit`, and the task name is `conductor/signed-session-retrofit`.

The definition of done was not "the task works locally." It was a green automated review on a pull request:

- OpenAI-compatible quality gates (artificiality, similarity, rubric, deep review).
- Deterministic validation (static checks, Oracle reward 1.0, Nop reward 0.0).
- Difficulty gates (`Pass@3`, `Pass@5`).
- Solvability gate (closed-model Astra trials).
- Fairness gates (ambiguity audit, AVA verifier audit).
- Conversion QC, which only passes if every upstream check succeeds.
- An attempt budget: a scored round with valid trials spends attempts; an empty-commit rerun of unchanged files is free.

The original task asked for a standard-library WSGI replacement for a plaintext-cookie app. It passed all non-difficulty gates quickly, then failed difficulty seven times. The final task asks the agent to **probe a compiled reference service and reconstruct its behaviour** in `/app/secure_app.py`, with the reference absent from the verifier.

That difference is the whole point. The first task told the agent what the answer was. The second task gives the agent an oracle and requires an implementation that survives without it.

---

## 2. The machine: annotated repository tree

The shipped task is fourteen files. Every one has a job; nothing is decorative.

```text
tasks/signed-session-retrofit/
├── instruction.md              # The ask: probe the black box, deliver secure_app.py,
│                               # no proxying, 8-hour budget, 200 KB module limit.
├── task.toml                   # Task metadata: name, description, difficulty/rubric
│                               # explanations, category Software/Systems, timeouts.
├── workstream.json             # P02/W3 acceptance criteria and milestone coverage.
├── task_design.md              # Situation, hard milestones, how it is solved/checked.
├── environment/
│   ├── Dockerfile              # Agent image: Python 3.13 slim (pinned digest),
│   │                           # legacy app, launcher and both reference binaries.
│   ├── legacy_app.py           # The insecure baseline the replacement must displace.
│   ├── refsvc                  # POSIX launcher: picks amd64 or arm64 by uname -m.
│   ├── refsvc-amd64            # 5.8 MB Go black-box reference, Linux amd64.
│   └── refsvc-arm64            # Same reference, Linux arm64.
├── solution/
│   ├── solve.sh                # Copies secure_app.py into /app for Oracle trials.
│   └── secure_app.py           # Reference solution: HMAC token, shared locked
│                               # revocation, retired secrets, multi-worker safe.
└── tests/
    ├── Dockerfile              # Verifier image; /app writable, /logs/verifier 0700.
    ├── test.sh                 # pytest with CTRF plugin flags that actually exist.
    └── test_outputs.py         # Black-box HTTP verifier; agent code runs in a
                                # separate unprivileged WSGI process.
```

The verifier image deliberately does **not** contain `refsvc`. That is the structural anti-proxy control: even if an agent writes code that calls the reference, there is nothing to call at verification time.

The image is pinned:

```text
python:3.13-slim-bookworm@sha256:a5a7017efc5969e00ae2b91c8eb0631049a569652aa4ffc4501769049ae45c72
```

The CTRF flags matter. The stock template's flags are stale; the working invocation uses:

```bash
python3 -m pytest test_outputs.py -p ctrf --ctrf=/logs/verifier/ctrf.json
```

---

## 3. Dependency graph: which artifact feeds which stage

The work was a pipeline of evidence, not a list of edits.

```text
legacy_app.py ────────────────┐
                              ├──> prose signed-session task ──> 7x "3/3 solved"
reference solution ───────────┘                                   (rejected)

agent trajectories from scored rounds
        └──> shared shortcut identified: prose named the mechanism

Go main.go ──> refsvc-amd64 / refsvc-arm64 ──┐
                                              ├──> conformance.py ──> 18/18 parity
Python secure_app.py ─────────────────────────┘
                                              │
                                              └──> environment/ binaries + launcher
                                                          │
instruction.md rewritten as probing task ───────────────────┤
workstream.json + task_design.md synced ─────────────────────┤
tests/test_outputs.py unchanged black-box HTTP assertions ───┤
                                                              v
                                          local Harbor Oracle/Nop + cheat sims
                                                              │
                                                              v
                                                    pushed PR review gates
                                                              │
                       findings loop: rubric -> ambiguity -> solvability
                                                              v
                                                21 SUCCESS / 12 SKIPPED
```

The hinge file is `solution/secure_app.py`. It is both the Oracle solution and the behavioural specification that `conformance.py` holds the Go binary to. If those two diverge, the task stops being fair.

---

## 4. Data contracts

These are the fields that later stages key on. Change one without the others and a gate fails.

### 4.1 Task metadata

`task.toml` top-level `artifacts = ["/app/secure_app.py"]`. `[task].name = "conductor/signed-session-retrofit"`. `[task].description` describes a standard-library module reconstructed from a probeable service. `[metadata].subcategory = "Systems"` — server-side WSGI work is not `Frontend`. `[agent].timeout_sec = 28800.0`. Do not set `allow_internet` at all; either value fails.

`solution_explanation` had to name the real insights. The passing text is:

```text
Probe the reference service to infer its observable rules, then implement
signed sessions with an HMAC over a token payload carrying the user and expiry.
A shared, locked revocation record is consulted on every protected request so
independent workers and restarts agree on which sessions remain valid.
```

A generic sentence ("build an independent WSGI handler with the same behaviour") failed `solution_explanation_quality`. So did an earlier version that described in-process state while the reference used a shared file.

### 4.2 Workstream and design documents

`workstream.json` must carry `P02` / `W3` — not `WS3`; the repo validator resolves the assignment from the repo name and rejects `WS3`. `task_design.md` requires `Situation`, `Why it is hard`, `Hard milestones`, `How it is solved` and `How it is checked` as **rows in the Task Information table**, not standalone sections. `Situation` must be over 40 words.

Test functions must be exactly `test_M<n>_<description>`, one per milestone in `task_design.md`. A workstream acceptance criterion with no assertion in its milestone's test triggers `conductor_milestones_in_tests`.

### 4.3 Reference service contract

The Go reference speaks HTTP over a single handler. Its environment contract:

| Variable | Meaning |
| --- | --- |
| `SESSION_SECRET` | Current signing secret; empty falls back to `development-secret`. |
| `SESSION_PREVIOUS_SECRET` | Comma-separated retired secrets; used for verification, never issuance. |
| `SESSION_TTL_SECONDS` | Token lifetime in seconds; default `3600`. |
| `REFSVC_STATE` | Override for the JSON state path; default `/tmp/refsvc-state.json`. |

Token format is `base64url(json).base64url(hmac_sha256(body))`, with payload fields `s` (random session id), `u` (user) and `e` (expiry as float seconds). Cookie name is `session`. Cookie attributes are `Path=/; HttpOnly; SameSite=Lax; Secure`.

State is one JSON object:

```json
{"revoked": ["<session-id>", "..."]}
```

Read-modify-write is guarded by a sibling `.lock` file with `flock`. That is what makes logout and rotation visible to independent workers and after restart.

Route table:

| Method | Path | Behaviour |
| --- | --- | --- |
| `POST` | `/login` | Requires `user`; issues token, `303` to `/whoami`, sets cookie. |
| `GET` | `/whoami` | `200` with `<p>user: ...</p>` if accepted, else `401 <p>no session</p>`. |
| `POST` | `/logout` | Revokes current session, clears cookie, `303`. |
| `POST` | `/rotate` | Revokes current session, issues a replacement, `303`. |
| anything else | any | `404 <p>not found</p>`. |

Two conventions are deliberately non-obvious and had to be hinted, not hidden: `SESSION_PREVIOUS_SECRET` may carry comma-separated entries, and the first `session` cookie in a duplicated header wins. Both are discoverable by probing; both failed the ambiguity audit until the instruction said to probe multi-value forms explicitly.

### 4.4 Verifier contract

The verifier starts the submitted module with a `setpriv --reuid=65534 --regid=65534 --clear-groups --no-new-privs` subprocess. Agent code never enters the pytest process — otherwise `os._exit(0)` at import scores 1. `/logs/verifier` is `0700` and root-owned. `/app` is `0777` in the verifier image, because a solver storing state beside its module is legitimate.

Every assertion uses random names, secrets and timings. Reward is written only by the root process. CTRF is emitted at `/logs/verifier/ctrf.json`.

One extra guard: `assert os.path.getsize("/app/secure_app.py") < 200_000`. The 5.8 MB reference binary, base64-encoded inside the module, cannot fit.

---

## 5. Why the prose task kept failing

Seven scored rounds, all `3/3 solved`. The rounds were not cosmetic. Each added a real operational property, and each was checked locally against the previous agents' artifacts before pushing.

| Round | Added requirement | Local check | Scored result |
| --- | --- | --- | --- |
| 1 | Restart-persistent revocation | prior artifacts reward 0, reference 1 | 3/3 |
| 2 | Logout survives restart | alignment test added | 3/3 |
| 3 | One retired signing secret | prior artifacts reward 0 | 3/3 |
| 4 | Multiple retired secrets | prior artifacts reward 0 | 3/3 |
| 5 | Shared revocation across workers | real two-worker test | 3/3 |
| 6 | Recorded HTTP trace corpus | agents read and generalized from samples | 3/3 |
| 7 | Request-shape conformance trace | one prior artifact reward 0, 5 failed | 3/3 |

The trajectory data explained why. Each agent finished in about five minutes and used roughly 15–20k reasoning tokens against an eight-hour budget. More rules did not create difficulty; they created more checklist items.

Two non-task problems surfaced in the same period. The Daytona runner failed with `MissingExtraError: The 'daytona' package is required but not installed` because the private index had supplied `daytona==2.1.0` without `daytona-sdk`. I published a compatible shim as a gist and posted the diagnosis on the PR; maintainers fixed the pipeline. `Semantic similarity` also flaked twice with an opencode five-minute cancellation and passed unchanged on the next run. Neither was "fixed" by editing task files, which is the correct response to an infrastructure fault.

> The slop janitor's note: an eight-hour timeout is not difficulty. If the problem is solvable in five minutes, the clock is decoration.

---

## 6. The pivot: a probeable black box

The replacement design had four parts: agent workspace with the legacy app and runtime constraints; a black-box reference executable; the agent's reconstructed `secure_app.py`; an independent conformance verifier using fresh randomized inputs. The reference must be removable — proxying is explicitly tested by absence.

I wrote the reference in Go because Go was available locally and cross-compiles to Linux with `CGO_ENABLED=0`. This is the exact source of `main.go` that produced both binaries.

```go
package main

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

type payload struct {
	S string  `json:"s"`
	U string  `json:"u"`
	E float64 `json:"e"`
}

type state struct {
	Revoked []string `json:"revoked"`
}

var (
	secret  []byte
	retired [][]byte
	ttl     float64
	stateMu sync.Mutex
)

var statePath = "/tmp/refsvc-state.json"

func b64(raw []byte) string { return base64.RawURLEncoding.EncodeToString(raw) }

func unb64(text string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(text)
}

func signature(body string, key []byte) string {
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(body))
	return b64(mac.Sum(nil))
}

func issue(user string) string {
	raw := make([]byte, 32)
	rand.Read(raw)
	p := payload{S: b64(raw), U: user, E: float64(time.Now().UnixNano())/1e9 + ttl}
	encoded, _ := json.Marshal(p)
	body := b64(encoded)
	return body + "." + signature(body, secret)
}

func claims(token string) (payload, bool) {
	var p payload
	parts := strings.SplitN(token, ".", 2)
	if len(parts) != 2 {
		return p, false
	}
	valid := hmac.Equal([]byte(signature(parts[0], secret)), []byte(parts[1]))
	for _, key := range retired {
		if hmac.Equal([]byte(signature(parts[0], key)), []byte(parts[1])) {
			valid = true
		}
	}
	if !valid {
		return p, false
	}
	raw, err := unb64(parts[0])
	if err != nil {
		return p, false
	}
	if err := json.Unmarshal(raw, &p); err != nil {
		return p, false
	}
	return p, p.E > float64(time.Now().UnixNano())/1e9 && p.S != "" && p.U != ""
}

func locked(exclusive bool, fn func()) {
	lockPath := statePath + ".lock"
	f, err := os.OpenFile(lockPath, os.O_CREATE|os.O_RDWR, 0600)
	if err != nil {
		fn()
		return
	}
	defer f.Close()
	how := syscall.LOCK_SH
	if exclusive {
		how = syscall.LOCK_EX
	}
	syscall.Flock(int(f.Fd()), how)
	defer syscall.Flock(int(f.Fd()), syscall.LOCK_UN)
	fn()
}

func load() state {
	raw, err := os.ReadFile(statePath)
	if err == nil {
		var s state
		if json.Unmarshal(raw, &s) == nil {
			return s
		}
	}
	return state{Revoked: []string{}}
}

func save(s state) {
	temporary := fmt.Sprintf("%s.%d.%d", statePath, os.Getpid(), time.Now().UnixNano())
	raw, _ := json.Marshal(s)
	os.WriteFile(temporary, raw, 0600)
	os.Rename(temporary, statePath)
}

func verify(token string) (string, bool) {
	p, ok := claims(token)
	if !ok {
		return "", false
	}
	accepted := false
	locked(false, func() {
		s := load()
		for _, id := range s.Revoked {
			if id == p.S {
				return
			}
		}
		accepted = true
	})
	return p.U, accepted
}

func revoke(token string, changeSerial bool) bool {
	p, ok := claims(token)
	if !ok {
		return false
	}
	changed := false
	locked(true, func() {
		s := load()
		for _, id := range s.Revoked {
			if id == p.S {
				return
			}
		}
		s.Revoked = append(s.Revoked, p.S)
		save(s)
		changed = true
	})
	return changed && ok
}

func escape(value string) string {
	value = strings.ReplaceAll(value, "&", "&amp;")
	value = strings.ReplaceAll(value, "<", "&lt;")
	value = strings.ReplaceAll(value, ">", "&gt;")
	value = strings.ReplaceAll(value, "\"", "&quot;")
	return strings.ReplaceAll(value, "'", "&#x27;")
}

func reply(w http.ResponseWriter, status int, body string, location string, cookie string) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if location != "" {
		w.Header().Set("Location", location)
	}
	if cookie != "" {
		w.Header().Set("Set-Cookie", cookie)
	}
	w.WriteHeader(status)
	fmt.Fprint(w, body)
}

func cookieToken(r *http.Request) string {
	for _, part := range strings.Split(r.Header.Get("Cookie"), ";") {
		name, value, found := strings.Cut(strings.TrimSpace(part), "=")
		if found && name == "session" {
			return value
		}
	}
	return ""
}

func serve(w http.ResponseWriter, r *http.Request) {
	path, method := r.URL.Path, r.Method
	token := cookieToken(r)
	user, valid := verify(token)
	if path == "/login" && method == "POST" {
		raw, _ := io.ReadAll(r.Body)
		form, _ := url.ParseQuery(string(raw))
		name := strings.TrimSpace(form.Get("user"))
		if name == "" {
			reply(w, 400, "<p>user is required</p>", "", "")
			return
		}
		issued := issue(name)
		reply(w, 303, "<p>ok</p>", "/whoami",
			"session="+issued+"; Path=/; HttpOnly; SameSite=Lax; Secure")
		return
	}
	if path == "/whoami" && method == "GET" {
		if !valid {
			reply(w, 401, "<p>no session</p>", "", "")
			return
		}
		reply(w, 200, "<p>user: "+escape(user)+"</p>", "", "")
		return
	}
	if path == "/logout" && method == "POST" {
		revoke(token, false)
		reply(w, 303, "<p>ok</p>", "/whoami",
			"session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure")
		return
	}
	if path == "/rotate" && method == "POST" {
		if !valid {
			reply(w, 401, "<p>no session</p>", "", "")
			return
		}
		revoke(token, true)
		reply(w, 303, "<p>ok</p>", "/whoami",
			"session="+issue(user)+"; Path=/; HttpOnly; SameSite=Lax; Secure")
		return
	}
	reply(w, 404, "<p>not found</p>", "", "")
}

func main() {
	port := flag.Int("port", 8000, "listen port")
	flag.Parse()
	if override := os.Getenv("REFSVC_STATE"); override != "" {
		statePath = override
	}
	secret = []byte(os.Getenv("SESSION_SECRET"))
	if len(secret) == 0 {
		secret = []byte("development-secret")
	}
	for _, part := range strings.Split(os.Getenv("SESSION_PREVIOUS_SECRET"), ",") {
		if part != "" {
			retired = append(retired, []byte(part))
		}
	}
	seconds, err := strconv.Atoi(os.Getenv("SESSION_TTL_SECONDS"))
	if err != nil {
		seconds = 3600
	}
	ttl = float64(seconds)
	stateMu.Lock()
	http.HandleFunc("/", serve)
	server := &http.Server{
		Addr:              fmt.Sprintf(":%d", *port),
		ReadHeaderTimeout: 10 * time.Second,
	}
	if err := server.ListenAndServe(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
```

Build commands, executed from the prototype directory:

```bash
go mod init refsvc
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o refsvc-amd64 .
GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o refsvc-arm64 .
go vet ./...
```

Two prototype bugs are worth keeping. The Go service originally bound `127.0.0.1:<port>` inside Docker and host `curl` got `Recv failure: Connection reset by peer`; binding `:<port>` fixed it. More subtly, `unb64` initially added `=` padding before calling `base64.RawURLEncoding.DecodeString`. Go's raw decoder rejects padding, so tokens with certain lengths failed while others worked — the symptom was an intermittent `401` on `/whoami` for a freshly issued token. Removing the padding made parity deterministic.

The conformance harness started both services, normalized opaque token values, and compared status, relevant headers and body. This is the exact comparison script:

```python
"""Compare the Python reference and the Go black-box reference over HTTP."""

import http.client
import json
import os
import pathlib
import socket
import subprocess
import sys
import time
import uuid

SOL = pathlib.Path("/Users/danielkliewer/Conductor/full-stack-engineering-legacy-web-modernization-3460bd69-c486a51e5d81/tasks/signed-session-retrofit/solution")
BINARY = "/Users/danielkliewer/.hermes/cache/scratch/refsvc/refsvc-arm64"

SERVER = (
    "import sys\nsys.path.insert(0, sys.argv[2])\nimport secure_app\n"
    "from wsgiref.simple_server import make_server\n"
    "make_server('127.0.0.1', int(sys.argv[1]), secure_app.application).serve_forever()\n"
)


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def req(port, method, path, body=None, cookie_header=None):
    headers = {}
    if cookie_header is not None:
        headers["Cookie"] = cookie_header
    if body is not None:
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    c = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    c.request(method, path, body=body, headers=headers)
    r = c.getresponse()
    text = r.read().decode("utf-8", "replace")
    out = {"status": r.status,
           "headers": {k.lower(): v for k, v in r.getheaders()
                       if k.lower() in ("location", "set-cookie")},
           "body": text.strip()}
    c.close()
    return out


def normalize(response):
    headers = dict(response["headers"])
    if "set-cookie" in headers:
        value = headers["set-cookie"]
        if value.startswith("session=") and "Max-Age=0" not in value:
            value = "session=<TOKEN>" + value.partition(";")[2]
        headers["set-cookie"] = value
    return (response["status"], headers, response["body"])


class Service:
    def __init__(self, kind, secret, ttl="3600", previous=""):
        self.kind = kind
        self.port = free_port()
        self.secret = secret
        env = dict(os.environ, SESSION_SECRET=secret,
                   SESSION_TTL_SECONDS=ttl, SESSION_PREVIOUS_SECRET=previous)
        if kind == "python":
            self.handle = subprocess.Popen(
                [sys.executable, "-c", SERVER, str(self.port), str(SOL)],
                env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            self.container = None
        else:
            mounted = "/Users/danielkliewer/.hermes/cache/scratch/refsvc:/refsvc:ro"
            statemount = "/Users/danielkliewer/.hermes/cache/scratch/refsvc:/state"
            result = subprocess.run(
                ["docker", "run", "-d", "--rm", "-p",
                 f"{self.port}:{self.port}", "-v", mounted, "-v", statemount,
                 "-e", "REFSVC_STATE=/state/go-state.json",
                 "-e", f"SESSION_SECRET={secret}",
                 "-e", f"SESSION_TTL_SECONDS={ttl}",
                 "-e", f"SESSION_PREVIOUS_SECRET={previous}",
                 "python:3.13-slim", "/refsvc/refsvc-arm64", "-port", str(self.port)],
                capture_output=True, text=True, timeout=120)
            if result.returncode:
                raise RuntimeError(result.stderr[-1000:])
            self.container = result.stdout.strip()
            self.handle = None
        for _ in range(100):
            try:
                with socket.create_connection(("127.0.0.1", self.port), timeout=0.5):
                    return
            except OSError:
                time.sleep(0.1)
        raise RuntimeError("service did not start")

    def stop(self):
        if self.handle:
            self.handle.terminate()
        if self.container:
            subprocess.run(["docker", "stop", self.container],
                           capture_output=True, timeout=60)


def compare(label, left, right):
    a, b = normalize(left), normalize(right)
    if a != b:
        print("MISMATCH", label)
        print("  python:", a)
        print("  go    :", b)
        return False
    print("ok", label)
    return True


secret = uuid.uuid4().hex
services = [Service("python", secret), Service("go", secret)]
p, g = services[0].port, services[1].port
checks = []
name = "Ada & <Bob> 'x'"
login = [req(s.port, "POST", "/login", body="user=" + name) for s in services]
checks.append(compare("login", *login))
tokens = [r["headers"]["set-cookie"].partition("=")[2].partition(";")[0] for r in login]
checks.append(compare("whoami", *[req(s.port, "GET", "/whoami", cookie_header="session=" + t)
                                 for s, t in zip(services, tokens)]))
checks.append(compare("no cookie", *[req(s.port, "GET", "/whoami") for s in services]))
checks.append(compare("tampered", *[req(s.port, "GET", "/whoami",
                                        cookie_header="session=x" + t[1:])
                                   for s, t in zip(services, tokens)]))
for method, path in (("GET", "/nope"), ("GET", "/login"), ("POST", "/whoami"), ("GET", "/rotate")):
    checks.append(compare(method + " " + path, *[req(s.port, method, path) for s in services]))
checks.append(compare("duplicate first-valid", *[req(s.port, "GET", "/whoami",
     cookie_header="session=" + t + "; session=x" + t[1:]) for s, t in zip(services, tokens)]))
checks.append(compare("duplicate second-valid", *[req(s.port, "GET", "/whoami",
     cookie_header="session=x" + t[1:] + "; session=" + t) for s, t in zip(services, tokens)]))
checks.append(compare("Session case", *[req(s.port, "GET", "/whoami",
     cookie_header="Session=" + t) for s, t in zip(services, tokens)]))
checks.append(compare("logout", *[req(s.port, "POST", "/logout",
                                    cookie_header="session=" + t) for s, t in zip(services, tokens)]))
checks.append(compare("after logout", *[req(s.port, "GET", "/whoami",
                                           cookie_header="session=" + t) for s, t in zip(services, tokens)]))

rot_login = [req(s.port, "POST", "/login", body="user=rot-<random>") for s in services]
rot_tokens = [r["headers"]["set-cookie"].partition("=")[2].partition(";")[0] for r in rot_login]
rotated = [req(s.port, "POST", "/rotate", cookie_header="session=" + t)
           for s, t in zip(services, rot_tokens)]
checks.append(compare("rotate", *rotated))
new_tokens = [r["headers"]["set-cookie"].partition("=")[2].partition(";")[0] for r in rotated]
checks.append(compare("old after rotate", *[req(s.port, "GET", "/whoami", cookie_header="session=" + t)
                                            for s, t in zip(services, rot_tokens)]))
for s in services:
    s.stop()
services = [Service("python", secret), Service("go", secret)]
p, g = services[0].port, services[1].port
checks.append(compare("new after restart", *[req(s.port, "GET", "/whoami", cookie_header="session=" + t)
                                             for s, t in zip(services, new_tokens)]))
checks.append(compare("old after restart", *[req(s.port, "GET", "/whoami", cookie_header="session=" + t)
                                             for s, t in zip(services, rot_tokens)]))
services[0].stop(); services[1].stop()

services = [Service("python", "new-secret", previous="old-secret"),
            Service("go", "new-secret", previous="old-secret")]
old = []
for s in services:
    r = req(s.port, "POST", "/login", body="user=legacy")
    old.append(r["headers"]["set-cookie"].partition("=")[2].partition(";")[0])
services[0].stop(); services[1].stop()
services = [Service("python", "new-secret", previous="old-secret"),
            Service("go", "new-secret", previous="old-secret")]
checks.append(compare("restart with new secret", *[req(s.port, "GET", "/whoami", cookie_header="session=" + t)
                                                   for s, t in zip(services, old)]))
for s in services:
    s.stop()

print("SUMMARY", sum(checks), "/", len(checks), "conformance checks passed")
```

Result:

```text
SUMMARY 18 / 18 conformance checks passed
```

That 18/18 is the proof that shipping a black box is not the same as hiding the instruction in a binary. Go and Python agree on login, identity, tampering, method/path handling, duplicate cookies, case sensitivity, logout, rotation, restart and secret change.

---

## 7. Integration: turning the prototype into the task

One launcher and two binaries went into `environment/`. The launcher:

```sh
#!/bin/sh
set -eu
case "$(uname -m)" in
  x86_64|amd64) BIN=/app/refsvc-amd64 ;;
  aarch64|arm64) BIN=/app/refsvc-arm64 ;;
  *) echo "unsupported architecture" >&2; exit 1 ;;
esac
exec "$BIN" "$@"
```

The agent Dockerfile copies `/usr/local/bin/refsvc` and both `/app/refsvc-*` binaries and `chmod 755` them. The sample-trace corpus from the failed sixth round was removed with `git rm -r`; a black-box task should not also ship a behaviour transcript.

The instruction was rewritten around probing. Its load-bearing clauses are:

- Run `refsvc -port 8000`; set `SESSION_SECRET`, `SESSION_PREVIOUS_SECRET` and `SESSION_TTL_SECONDS` in its environment.
- "Probe as much as you need: the routes, the responses, the cookies, the way a session can be ended or replaced, the effect of changing inputs and secrets, and what survives a restart or a second worker."
- "Treat the reference as authoritative over library defaults: when a value can appear more than once, in an environment variable or in an HTTP header, probe that form explicitly, including comma-separated and repeated values."
- "Your module must reproduce what you observe **without depending on the reference**."
- "Keep `/app/secure_app.py` under 200 KB; the verifier rejects a larger module."

`workstream.json` and `task_design.md` were updated in the same commits. The verifier tests did not change for the pivot — they were already black-box HTTP assertions.

Local validation before the first black-box push:

```bash
bash checks/static-report.sh tasks/signed-session-retrofit
harbor trial start -p tasks/signed-session-retrofit -a oracle --trials-dir "$SCRATCH/bb-o1"
harbor trial start -p tasks/signed-session-retrofit -a nop --trials-dir "$SCRATCH/bb-n1"
docker build -q -t tb3-agent-bb -f tasks/signed-session-retrofit/environment/Dockerfile tasks/signed-session-retrofit/environment
docker run --rm tb3-agent-bb sh -c 'command -v refsvc; ls /app | sort; echo samples=$(test -d /app/samples && echo yes || echo no)'
docker build -q -t tb3-verify-bb -f tasks/signed-session-retrofit/tests/Dockerfile tasks/signed-session-retrofit/tests
docker run --rm tb3-verify-bb sh -c 'command -v refsvc || echo no-reference-binary'
```

Results: all static checks passed; Oracle `{'reward': 1.0}`; Nop `{'reward': 0.0}`; agent image had `refsvc` and no `/app/samples`; verifier image reported `no-reference-binary`. A live probe with `refsvc -port 18100` and `curl -X POST --data 'user=probe' .../login` returned `HTTP/1.0 303 See Other`.

---

## 8. Gate findings and the fixes that closed them

The review pipeline found five substantive issues after the pivot. Each was real. None was fixed by weakening a test.

| Gate | Finding | Fix | Verification |
| --- | --- | --- | --- |
| Ambiguity audit | Verifier drops to uid 65534 but `/app` was root-owned; a solution storing state beside its module failed for an unstated reason. | `chmod 777 /app` in verifier Dockerfile. | Modified Oracle using a state file beside the module: `5 passed`, reward 1. |
| Ambiguity audit | Comma-separated retired secrets and first-duplicate-cookie ordering were unhinted conventions. | Instruction now says to probe multi-value forms explicitly. | Audit PASS on the next full run. |
| Implementation rubric | `anti_cheat_robustness`: an agent could embed the 5.8 MB binary in `secure_app.py` and proxy. | 200 KB module limit, stated in instruction and asserted in `test_M1_login_and_whoami`. | Oversized module: reward 0, `4 passed` (size assertion failed). |
| Implementation rubric | `solution_explanation_quality`: one generic sentence named no key insights. | Metadata now names HMAC, payload and shared locked revocation. | Rubric PASS. |
| Pass@3 solvability (Astra) | `too_difficult`: all three closed-model trials failed only `test_M5_rotation_invalidates_old_token`; they found logout but not rotation. | Narrow hint: probe "the way a session can be ended or replaced." | Astra attempt 1 solved; attempts 2 and 3 skipped by short-circuit; aggregate PASS. |

Two process mistakes were mine and are worth recording. First, I added the size assertion without importing `os` in `test_outputs.py`; Oracle dropped to 0 with `NameError: name 'os' is not defined`. Import added, Oracle returned to 1.0. Second, I initially read the three "Solvability attempt" checks passing as evidence that the trials had solved the task. They had only preserved evidence. The aggregate job's `classify_solvability.py` had classified `too_difficult`. Reading the summary artifact settled it: `solved: 0`, `failed: 3`, every trial failing the same rotation assertion.

---

## 9. Exact ordering: the commands I ran

Order is where these pipelines break. This is the sequence, compressed only where a command was a simple `git add`/`commit`/`push` cycle.

```bash
# 1. Deterministic checks and Harbor validation, from the task repo
bash checks/static-report.sh tasks/signed-session-retrofit
python3 checks/check-conductor-workstreams.py tasks/signed-session-retrofit
python3 checks/check-conductor-task-design.py tasks/signed-session-retrofit
harbor trial start -p tasks/signed-session-retrofit -a oracle --trials-dir "$SCRATCH/oracle"
harbor trial start -p tasks/signed-session-retrofit -a nop --trials-dir "$SCRATCH/nop"

# 2. Go prototype
cd /Users/danielkliewer/.hermes/cache/scratch/refsvc
go mod init refsvc
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o refsvc-amd64 .
GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o refsvc-arm64 .
python3 conformance.py > run.log 2>&1
grep -nE 'MISMATCH|SUMMARY' run.log

# 3. Agent and verifier image checks
docker build -q -t tb3-agent-bb -f tasks/signed-session-retrofit/environment/Dockerfile tasks/signed-session-retrofit/environment
docker run --rm tb3-agent-bb sh -c 'command -v refsvc; ls /app | sort'
docker build -q -t tb3-verify-bb -f tasks/signed-session-retrofit/tests/Dockerfile tasks/signed-session-retrofit/tests
docker run --rm tb3-verify-bb sh -c 'command -v refsvc || echo no-reference-binary'

# 4. Previous-agent regression checks (the difficulty test that matters)
for f in "$D"/task__*/artifacts/app/secure_app.py; do
  cp "$f" "$SCRATCH/old-agent-$i.py"
  docker run --rm -v "$logs:/logs/verifier" -v "$SCRATCH/old-agent-$i.py:/app/secure_app.py:ro" \
    tb3-verify-hard bash -c 'bash /tests/test.sh >/tmp/o 2>&1; cat /logs/verifier/reward.txt'
done
# Result after the restart-hardening round: agent 1/2/3 reward=0 (3 passed),
# reference reward=1 (5 passed).

# 5. Writable-/app reproduction of the auditor's case
cp tasks/signed-session-retrofit/solution/secure_app.py "$SCRATCH/state-next-to-module.py"
# patch _STATE_PATH to os.path.join(os.path.dirname(os.path.abspath(__file__)), ".session_state.json")
docker build -q -t tb3-verify-writable -f tasks/signed-session-retrofit/tests/Dockerfile tasks/signed-session-retrofit/tests
docker run --rm -v "$logs:/logs/verifier" -v "$SCRATCH/state-next-to-module.py:/app/secure_app.py:ro" \
  tb3-verify-writable bash -c 'bash /tests/test.sh >/tmp/o 2>&1; cat /logs/verifier/reward.txt'
# Result: 5 passed, reward=1.

# 6. Oversized-module cheat simulation
python3 -c "
p='tasks/signed-session-retrofit/solution/secure_app.py'
s=open(p).read()
open('$SCRATCH/oversized.py','w').write(s + '\n# padding\n' + '#'*210000)
"
docker run --rm -v "$logs:/logs/verifier" -v "$SCRATCH/oversized.py:/app/secure_app.py:ro" \
  tb3-verify-size2 bash -c 'bash /tests/test.sh >/tmp/o 2>&1; cat /logs/verifier/reward.txt'
# Result: reward=0, size assertion failed.

# 7. Push and poll
git add -A && git commit -m "Make the task a black-box behavioural reconstruction" && git push origin submission
gh pr checks 1 --repo handshake-project-conductor/full-stack-engineering-legacy-web-modernization-3460bd69-c486a51e5d81
gh run list --repo handshake-project-conductor/full-stack-engineering-legacy-web-modernization-3460bd69-c486a51e5d81 --workflow 'TB3 Review' --limit 1

# 8. Read a failed gate's evidence
REPO=handshake-project-conductor/full-stack-engineering-legacy-web-modernization-3460bd69-c486a51e5d81
gh api repos/$REPO/actions/jobs/<job-id>/logs > "$SCRATCH/job.log"
sed -n '/### Top issues/,/### Criteria/p' "$SCRATCH/job.log"
gh api repos/$REPO/actions/artifacts/<artifact-id>/zip > out.zip
unzip -oq out.zip -d out && cat out/comment.md && python3 -m json.tool out/report.json

# 9. Inspect Astra solvability failures
gh api repos/$REPO/actions/artifacts/14683888673/zip > sum.zip
unzip -oq sum.zip -d sum && python3 -m json.tool sum/summary.json
# Result: solved 0, failed 3, all failing M5 rotation.
```

---

## 10. Traps, each tied to the measurement that exposed it

| Trap | Step | Measurement | Root cause |
| --- | --- | --- | --- |
| Stale CTRF flags | First task validation | Oracle scored 0 | `pytest-json-ctrf` uses `-p ctrf --ctrf=`; the template's `--json-ctrf` fails. |
| Runner missing extra | Pass@3 after runner repair | `MissingExtraError` for `daytona` | Private index supplied `daytona==2.1.0` without `daytona-sdk`. Infrastructure, not task. |
| "3/3 solved" interpreted as success | Seven difficulty rounds | `3 valid trial(s), 3 solved` each time | Agents used 15–20k tokens in ~5 minutes; the contract named the mechanism. |
| Read-only `/app` | Ambiguity audit | Modified Oracle failed under uid 65534 | Verifier image did not grant write permission beside the module. |
| Hidden multi-value forms | Ambiguity audit | Defensible implementation failed on comma/repeated values | Instruction described singular variables and a single cookie. |
| Import-cheat reward forgery | Earlier verifier design | `os._exit(0)` at import scored 1 | Agent code shared the pytest process. |
| Embedded reference binary | Implementation rubric | 5.8 MB binary fits in a Python module | No resource constraint on the deliverable. |
| Missing `os` import | Size-guard validation | Oracle 0, `NameError: name 'os' is not defined` | New assertion used an unimported module. |
| Generic solution metadata | Implementation rubric | `solution_explanation_quality` FAIL | Explanations must name HMAC, payload and shared locked state. |
| Attempt jobs confused with solves | Solvability aggregate | Three "attempt success" checks but aggregate `too_difficult` | "Success" meant evidence preserved; `summary.json` had `solved: 0`. |
| Opencode five-minute cancellation | Semantic similarity, twice | `The job has exceeded the maximum execution time of 5m0s` | Infrastructure flake; an unchanged-file rerun passed in 1m7s. |

The structural fix for the import cheat is the one I would keep in every stateful task: serve the submitted module in a separate unprivileged process. The CTRF write, reward write and process teardown stay in the root process. That single boundary also makes `os._exit`, daemon reward rewriters and most other exit-status tricks irrelevant.

---

## 11. Final evidence

The green run was **`44849942474`**, completed `success` in **1h5m33s** on head `ddb568c`. The check report:

- **21 SUCCESS**, **12 SKIPPED**.
- `Task validation (Oracle + Nop)`: success, 1m22s.
- `Artificiality (C1)`: success, 48s.
- `Implementation rubric`: success, 8m30s.
- `Semantic similarity`: success, 1m7s.
- `Pass@3 difficulty`: success, 8m15s.
- `Pass@5 difficulty (combined Pass@8)`: success, 7m41s.
- `Pass@3 solvability (Astra)`: aggregate success after attempt 1 solved; attempts 2 and 3 skipped.
- `Ambiguity and unfair-verifier audit`: success, 1m57s.
- `AVA verifier audit`: success, 9m9s.
- `Conversion QC gate`: success, 5s.

Local evidence at the same commit:

- Oracle `{'reward': 1.0}`; Nop `{'reward': 0.0}`.
- Conformance `18 / 18`.
- Oversized module: reward 0.
- Writable-`/app` state-beside-module case: `5 passed`, reward 1.
- `git ls-tree` confirms exactly fourteen task files; no sample corpus remains.

PR state:

```text
base: main
head: submission
mergeable: MERGEABLE
state: OPEN
```

The task is deliberately hard but not impossible: standard difficulty trials were unsolved, while one closed-model solvability trial succeeded after the narrow "ended or replaced" hint. That is the calibration point we were looking for.

---

## 12. What I would tell an agent

1. **Read the assignment from the repo, not the checklist.** The catalog row is `W3`; a checklist saying `WS3` is wrong for this repo. The loader and `checks/` are authoritative.
2. **A benchmark that names its mechanism is a tutorial.** If agents solve 3/3 in five minutes, the bottleneck is the specification, not the timeout.
3. **Change the axis before adding another rule.** Restart, rotation, multi-worker state and sample traces were all real; all were learned. Ship an oracle and require reconstruction.
4. **Do not hide the contract in a binary and call it black-box.** Verify parity with a conformance harness over fresh inputs; here it was 18/18.
5. **Remove the reference from the verifier.** Proxy resistance is structural: there is nothing to proxy to.
6. **Never let agent code share the verifier process.** Separate unprivileged process, root-owned reward dir, random inputs.
7. **State environmental constraints.** A read-only `/app`, a module-size cap or a multi-value header are defects if the agent can only learn them by failing.
8. **Keep instructions, workstream, design doc and tests in lockstep.** An assertion without a stated property fails the rubric; a stated property without an assertion fails the criteria check.
9. **Read job logs and artifacts, not check titles.** Three "solvability attempt" successes did not mean three solves. `summary.json` said `solved: 0`.
10. **Distinguish infrastructure from task verdicts.** A missing SDK or an opencode timeout is not a reason to rewrite the task.
11. **Spend attempts deliberately.** Verify the previous agents fail locally before pushing a new rule; use free empty-commit reruns only for unchanged files.
12. **The cost of being wrong is measurable.** If a single missing hint makes all three solvability trials fail on one route, add the hint and re-measure. If all three solve, the difficulty gate will tell you.

The structure is the product. Anyone can copy the files; the transferable part is the ordering, the contracts and the refusal to call a green local test a finished benchmark.
