<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            if (!Schema::hasColumn('employees', 'account_name')) {
                $table->string('account_name')->nullable();
            }

            if (!Schema::hasColumn('employees', 'account_number')) {
                $table->string('account_number')->nullable();
            }

            if (!Schema::hasColumn('employees', 'pan_no')) {
                $table->string('pan_no', 20)->nullable();
            }

            if (!Schema::hasColumn('employees', 'projects')) {
                $table->json('projects')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            if (Schema::hasColumn('employees', 'projects')) {
                $table->dropColumn('projects');
            }

            if (Schema::hasColumn('employees', 'pan_no')) {
                $table->dropColumn('pan_no');
            }

            if (Schema::hasColumn('employees', 'account_number')) {
                $table->dropColumn('account_number');
            }

            if (Schema::hasColumn('employees', 'account_name')) {
                $table->dropColumn('account_name');
            }
        });
    }
};

