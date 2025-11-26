<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'account_name',
        'account_number',
        'ifsc_code',
        'pan_no',
        'projects',
        'status',
    ];

    protected $casts = [
        'projects' => 'array',
    ];
}
