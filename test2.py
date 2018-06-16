from __future__ import division

import numpy as np
from sklearn import manifold

arr = [[0 for x in range(3)] for y in range(3)]
arr[0][0] = 1
arr[1][0] = 4
arr[2][0] = 5
arr[0][1] = 4
arr[1][1] = 2
arr[2][1] = 6
arr[0][2] = 5
arr[1][2] = 6
arr[2][2] = 3

print(arr)
arr = np.array(arr) # TA MACIERZ MUSI BYĆ SYMETRYCZNA!

mds = manifold.MDS(n_components=2, max_iter=3000, eps=1e-9,
                   dissimilarity="precomputed", n_jobs=1)

pos = mds.fit(arr).embedding_
print(pos) # to narysować na froncie
