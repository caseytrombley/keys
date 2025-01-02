<template>
  <div class="logo font-weight-bold">key<span><span class="sup">&</span></span>chord</div>

</template>

<style lang="scss" scoped>
.logo {
  font-size: 2.25rem;
  .sup {
    position: relative;
    top: -0.35em;
    margin: 0 -0.05em 0 0;
    color: rgba(var(--v-theme-primary), 1);
    font-size: 0.75em;

  }
}


/* Dark Theme */
.v-theme--dark {
  .sup {
    color: rgba(var(--v-theme-primary), 1);
  }
}

/* Light Theme */
.v-theme--light {
  .sup {
    color: rgb(255, 155, 0);
  }
}
</style>
