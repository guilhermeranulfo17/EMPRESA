"""Folha de contato de um capítulo do onboarding: cada quadro com o passo e o foco desenhado."""
import json, sys, subprocess, os
raiz = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'onboarding')
m = json.load(open(os.path.join(raiz, 'manifesto.json')))
cap = next(c for c in m['capitulos'] if c['id'] == sys.argv[1])
saida = sys.argv[2]
tmp = []
for p in cap['passos']:
    for k, q in enumerate(p['quadros']):
        src = os.path.join(raiz, q['arquivo'])
        dst = saida + f"_{len(tmp):03d}.png"
        cmd = ['convert', src, '-resize', '640x']
        e = 640 / 1440
        if q.get('foco'):
            f = q['foco']; cmd += ['-fill', 'none', '-stroke', 'red', '-strokewidth', '3', '-draw', f"rectangle {f['x']*e},{f['y']*e} {(f['x']+f['w'])*e},{(f['y']+f['h'])*e}"]
        if q.get('cursor'):
            c = q['cursor']; cmd += ['-fill', 'blue', '-stroke', 'none', '-draw', f"circle {c['x']*e},{c['y']*e} {c['x']*e+6},{c['y']*e}"]
        cmd += ['-gravity', 'south', '-background', '#222', '-fill', 'white', '-splice', '0x22', '-pointsize', '15', '-annotate', '+0+3', f"{p['id']} {k+1}/{len(p['quadros'])}", dst]
        subprocess.run(cmd, check=True); tmp.append(dst)
subprocess.run(['montage', *tmp, '-tile', '5x', '-geometry', '+3+3', '-background', '#555', saida + '.png'], check=True)
for t in tmp: os.remove(t)
print(saida + '.png')
